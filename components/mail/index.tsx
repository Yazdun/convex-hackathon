import { Mail } from "@/components/mail/components/mail";
import { accounts, mails } from "@/components/mail/data";

export default function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />;
}
