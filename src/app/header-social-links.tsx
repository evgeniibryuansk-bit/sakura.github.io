"use client";

type HeaderSocialLinksProps = {
  showLabel?: boolean;
};

function VkIcon() {
  return (
    <span
      aria-hidden="true"
      className="text-[14px] font-black italic tracking-[-0.08em] text-current"
    >
      VK
    </span>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-current" aria-hidden="true">
      <path
        d="M8.7 8.6a12.3 12.3 0 0 1 6.6 0m-7.3 7.1c1.7 1.2 6.3 1.2 8 0m-8.6-8.3c-.9 1.3-1.5 2.8-1.8 4.4.9 1.1 2 2.1 3.2 2.8l.8-1.2m5.4-6c.9 1.3 1.5 2.8 1.8 4.4-.9 1.1-2 2.1-3.2 2.8l-.8-1.2M10 12.1h.01M14 12.1h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px] text-current" aria-hidden="true">
      <path
        d="M20.2 4.8L3.9 11.1c-.8.3-.8 1.4.1 1.7l4.1 1.3 1.6 4.7c.3.8 1.4.9 1.8.1l2.3-4.2 4.3-9.1c.4-.8-.4-1.6-1.2-1.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 14.1 18.5 5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HeaderSocialLinks({ showLabel = false }: HeaderSocialLinksProps) {
  const socialLinkBaseClassName =
    "inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8f98ab] transition hover:text-white";

  return (
    <div className="flex items-center gap-2">
      {showLabel ? (
        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#8f98ab]">
          Socials:
        </span>
      ) : null}
      <div className="flex items-center gap-1.5">
        <span
          title="VK soon"
          aria-label="VK coming soon"
          className={`${socialLinkBaseClassName} cursor-default opacity-70`}
        >
          <VkIcon />
        </span>
        <a
          href="https://discord.gg/NQbe3xEfu5"
          target="_blank"
          rel="noreferrer"
          aria-label="Discord"
          className={socialLinkBaseClassName}
        >
          <DiscordIcon />
        </a>
        <a
          href="https://t.me/sakura_dota2"
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
          className={socialLinkBaseClassName}
        >
          <TelegramIcon />
        </a>
      </div>
    </div>
  );
}
