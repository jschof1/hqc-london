import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';

// Run the actual handler in workerd, with an in-process HTTP receiver. No network
// traffic, credentials or customer data. Node mocks alone missed the unsupported
// redirect setting because Node accepts redirect:error and workerd does not.
const {outputFiles}=await build({
  stdin:{contents:"import {submitForm} from './src/lib/form-submission.ts'; export default {fetch(request,env){return submitForm(request,env,new URL(request.url).pathname.includes('/contact/')?'contact':'quote')}}",resolveDir:process.cwd()},
  bundle:true,write:false,platform:'browser',format:'esm',
});
const script=outputFiles[0].text;

test('Cloudflare runtime accepts valid enquiries and refuses receiver redirects',async()=>{
  const received=[];
  const mf=new Miniflare({modules:true,compatibilityDate:'2025-03-06',script,
    bindings:{QUOTE_FORM_WEBHOOK:'https://receiver.test/intake',CONTACT_FORM_WEBHOOK:'https://contact.test/intake'},
    outboundService:async request=>{
      const body=await request.json(); received.push(body);
      return body.details?.startsWith('Redirect fixture')
        ? new Response(null,{status:307,headers:{Location:'https://untrusted.test/'}})
        : Response.json({success:true});
    },
  });
  const body={name:'Runtime Test',email:'runtime@example.test',phone:'02079460999',
    postcode:'SW1A 1AA',service:'Deep Clean',route:'residential',details:'Valid fixture',privacy_consent:'yes'};
  const send=details=>mf.dispatchFetch('https://highqualityclean.co.uk/api/quote/',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,details})});
  try {
    const good=await send('Valid fixture');
    assert.equal(good.status,200,'valid enquiry must reach the receiver in workerd');
    assert.equal((await good.json()).ok,true);
    assert.equal(received.length,1);
    assert.equal(received[0].form_type,'quote');
    const redirect=await send('Redirect fixture');
    assert.equal(redirect.status,502);
    assert.equal((await redirect.json()).ok,undefined);
    assert.equal(received.length,2,'redirect must not forward the payload to another host');
    const contact=await mf.dispatchFetch('https://highqualityclean.co.uk/api/contact/', {
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:body.name,email:body.email,service:'supplier',message:'Question',route:'commercial',details:'Sales override'}),
    });
    assert.equal(contact.status,200,'Phase8 contact requires no fabricated privacy checkbox');
    assert.equal(received.at(-1).form_type,'contact');
    assert.equal(received.at(-1).route,undefined);
    assert.equal(received.at(-1).details,undefined);
    assert.equal(received.at(-1).privacy_notice_version,'phase8-batch6-2026-09-28');
    for(const buyer of ['property','agency']) {
      const property=await mf.dispatchFetch('https://highqualityclean.co.uk/api/quote/', {
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...body,route:'commercial',buyer,service:'End of Tenancy™',privacy_consent:undefined}),
      });
      assert.equal(property.status,200,'property intake works without commercial-only fields');
      assert.equal(received.at(-1).enquiry_type,'property');
      assert.match(received.at(-1).classification_tags,/hqc - type - property/);
    }
    const count=received.length;
    const preview=await mf.dispatchFetch('https://unknown.example/api/quote/', {
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
    });
    assert.equal(preview.status,202);
    assert.equal((await preview.json()).preview,true);
    assert.equal(received.length,count,'strict staging host guard never reaches a receiver');
  }finally{await mf.dispose()}
});
