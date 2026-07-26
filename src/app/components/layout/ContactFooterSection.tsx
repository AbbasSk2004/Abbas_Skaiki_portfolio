import { getContactInfo } from '@/api/public/contact';
import { ContactFooter } from './ContactFooter';
import type { ContactInfo } from '@/app/works/types';

// Server wrapper for the footer: fetches the contact singleton from the Express
// API (1-hour ISR via getContactInfo) and passes it to the client ContactFooter,
// which keeps the inquiry-form interactivity. Nav links stay hardcoded in the
// footer (they're route anchors, not CMS data).
//
// Defensive: if the API is down or contact info isn't set yet, we pass null and
// the footer falls back to its static contact details rather than crashing the
// whole layout (this footer renders on every page).
export const ContactFooterSection: React.FC = async () => {
  let contact: ContactInfo | null = null;
  try {
    contact = await getContactInfo();
  } catch (err) {
    console.error('[footer] Failed to load contact info; using fallbacks:', err);
  }

  return <ContactFooter contact={contact} />;
};
