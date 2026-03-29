"use client";

import type { CSSProperties, ReactNode } from "react";

type HeaderSocialLinksProps = {
  showLabel?: boolean;
};

type SocialLinkDefinition = {
  id: "vk" | "discord" | "telegram";
  label: string;
  href?: string;
  icon: ReactNode;
};

function VkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[15px] w-[15px] fill-current"
    >
      <path d="M3.97 7.24c.13-.6.54-.9 1.21-.9h2.6c.57 0 .92.28 1.05.83.46 1.9 1.14 3.54 2.05 4.92.28.41.53.61.76.61.17 0 .25-.23.25-.68V7.38c-.03-.67-.33-1.1-.91-1.27l-.45-.1c-.17-.1-.22-.24-.15-.42.09-.24.33-.37.71-.37h4.07c.52 0 .89.15 1.1.44.19.28.29.73.29 1.35v2.52c0 .27-.01.55-.03.84-.02.29-.04.52-.04.68 0 .16.02.33.06.49.04.16.11.24.2.24.2 0 .5-.19.89-.58.86-.95 1.64-2.36 2.34-4.23.18-.5.54-.76 1.08-.76h2.6c.31 0 .54.08.68.25.14.16.17.39.09.67-.21.99-.64 2.08-1.3 3.26-.66 1.18-1.23 2-1.7 2.45-.2.2-.3.36-.3.48 0 .15.11.34.34.57.1.08.25.22.46.42 1.1 1.03 1.94 2.08 2.52 3.15.16.29.18.55.08.79-.11.24-.31.35-.61.35h-2.89c-.42 0-.77-.15-1.03-.45l-1.37-1.57c-.1-.11-.21-.2-.33-.27-.12-.07-.23-.09-.32-.06-.1.03-.17.1-.23.2-.06.1-.1.2-.12.3-.02.1-.03.22-.03.35v1.43c0 .32-.1.56-.29.73-.19.16-.45.25-.78.27h-1.84c-.8.05-1.58-.1-2.33-.46-.75-.35-1.37-.81-1.86-1.36-.48-.55-.93-1.16-1.34-1.85-.41-.68-.73-1.31-.97-1.89-.24-.58-.43-1.11-.57-1.59-.14-.48-.24-.85-.3-1.11-.06-.26-.1-.4-.11-.43-.1-.47-.12-.81-.05-1.02Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[16px] w-[16px] fill-current"
    >
      <path d="M19.54 5.57A16.7 16.7 0 0 0 15.4 4.3a.08.08 0 0 0-.09.04c-.18.33-.38.76-.52 1.1a15.5 15.5 0 0 0-4.59 0 11.8 11.8 0 0 0-.53-1.1.08.08 0 0 0-.09-.04 16.67 16.67 0 0 0-4.15 1.27.07.07 0 0 0-.03.03C2.77 9.5 2.08 13.31 2.42 17.07a.08.08 0 0 0 .03.06 16.8 16.8 0 0 0 5.1 2.58.08.08 0 0 0 .09-.03c.39-.53.74-1.09 1.04-1.68a.08.08 0 0 0-.04-.11 10.9 10.9 0 0 1-1.6-.77.08.08 0 0 1-.01-.13c.11-.08.22-.17.32-.25a.08.08 0 0 1 .08-.01c3.35 1.53 6.98 1.53 10.3 0a.08.08 0 0 1 .09.01c.1.08.21.17.32.25a.08.08 0 0 1-.01.13c-.51.3-1.05.56-1.6.77a.08.08 0 0 0-.04.11c.31.58.66 1.14 1.04 1.68a.08.08 0 0 0 .09.03 16.75 16.75 0 0 0 5.1-2.58.08.08 0 0 0 .03-.06c.4-4.34-.67-8.12-2.99-11.47a.06.06 0 0 0-.03-.03ZM9.67 14.78c-1 0-1.82-.92-1.82-2.05s.8-2.05 1.82-2.05c1.02 0 1.84.93 1.82 2.05 0 1.13-.8 2.05-1.82 2.05Zm4.66 0c-1.01 0-1.82-.92-1.82-2.05s.8-2.05 1.82-2.05c1.03 0 1.84.93 1.82 2.05 0 1.13-.8 2.05-1.82 2.05Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[15px] w-[15px] fill-current"
    >
      <path d="M21.94 4.66c.28-.12.58.13.5.42l-3.1 14.58c-.05.24-.32.35-.53.23l-4.83-3.18-2.46 2.36c-.17.16-.46.05-.47-.19l-.17-4.05 8.46-7.64c.15-.14-.03-.38-.21-.27l-10.54 6.65-4.34-1.38c-.28-.09-.3-.48-.03-.59L21.94 4.66Z" />
    </svg>
  );
}

const SOCIAL_LINKS: SocialLinkDefinition[] = [
  {
    id: "vk",
    label: "VK",
    icon: <VkIcon />,
  },
  {
    id: "discord",
    label: "Discord",
    href: "https://discord.gg/NQbe3xEfu5",
    icon: <DiscordIcon />,
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/sakura_dota2",
    icon: <TelegramIcon />,
  },
];

const socialIconWrapperStyle: CSSProperties = {
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
};

export function HeaderSocialLinks({
  showLabel = false,
}: HeaderSocialLinksProps) {
  return (
    <div className="flex items-center gap-3">
      {showLabel ? (
        <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#8f98ab]">
          Socials:
        </span>
      ) : null}
      <div className="flex items-center gap-1 rounded-full border border-[#1d1d1d] bg-[#090909]/90 px-2.5 py-1.5">
        {SOCIAL_LINKS.map((link) => {
          const commonClassName =
            "inline-flex h-8 w-8 items-center justify-center rounded-full border text-[#8f98ab] transition duration-200";

          if (!link.href) {
            return (
              <span
                key={link.id}
                title={`${link.label} soon`}
                aria-label={`${link.label} coming soon`}
                style={socialIconWrapperStyle}
                className={`${commonClassName} cursor-default border-transparent bg-transparent opacity-75`}
              >
                {link.icon}
              </span>
            );
          }

          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              style={socialIconWrapperStyle}
              className={`${commonClassName} border-transparent bg-transparent hover:border-[#2b1b1e] hover:bg-[#140d11] hover:text-[#ffb7c5]`}
            >
              {link.icon}
            </a>
          );
        })}
      </div>
    </div>
  );
}
