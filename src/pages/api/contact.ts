import type { APIRoute } from 'astro';
import { submitForm } from '../../lib/form-submission';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};
  return submitForm(request, env, 'contact');
};
