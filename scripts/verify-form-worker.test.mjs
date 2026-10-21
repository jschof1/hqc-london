import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';

// Run the actual handler in workerd, with an in-process HTTP receiver. No network
// traffic, credentials or customer data. Node mocks alone missed the unsupported
// redirect setting because Node accepts redirect:error and workerd does not.
const {outputFiles}=await build({
  stdin:{contents:"import {submitForm} from './src/lib/form-submission.ts'; export default {fetch(request,env){return submitForm(request,env,'quote')}}",resolveDir:process.cwd()},
  bundle:true,write:false,platform:'browser',format:'esm',
});
const script=outputFiles[0].text;

test('Cloudflare runtime accepts valid enquiries and refuses receiver redirects',async()=>{
  const received=[];
  const mf=new Miniflare({modules:true,compatibilityDate:'2025-03-06',script,
    bindings:{QUOTE_FORM_WEBHOOK:'https://receiver.test/intake'},
    outboundService:async request=>{
      const body=await request.json(); received.push(body);
      return body.details.startsWith('Redirect fixture')
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
  }finally{await mf.dispose()}
});
