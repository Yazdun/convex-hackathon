import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { IInbox } from "../types/types";
import { useEffect, useState } from "react";
import { MarkdownFormatter } from "../markdown/mdx";

export function Inbox() {
  const inbox = useQuery(api.inbox.getUserInbox);

  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (inbox === undefined) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [inbox]);

  if (inbox === undefined && showLoading) {
    return <div className="p-2.5 grid gap-2.5">loading</div>;
  }

  if (!inbox) {
    return null;
  }

  return (
    <div>
      {inbox.map((item) => {
        return <InboxItem key={item._id} data={item} />;
      })}
    </div>
  );
}

function InboxItem({ data }: { data: IInbox }) {
  return (
    <div>
      <MarkdownFormatter text={data.announcement.content} />
    </div>
  );
}
