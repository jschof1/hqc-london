import type { APIRoute } from 'astro';
import { submitForm } from '../../lib/form-submission';

export const POST: APIRoute = ({ request, locals }) =>
  submitForm(request, (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {}, 'quick-form');
