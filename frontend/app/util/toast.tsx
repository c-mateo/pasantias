import React from "react";
import { addToast } from "@heroui/react";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
);

export const toast = {
  success: (opts: any) =>
    addToast({
      ...opts,
      icon: (
        <Icon>
          <svg height={20} viewBox="0 0 24 24" width={20} className="text-green-600" style={{ color: 'rgb(16 185 129)' }}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
              <path d="M20 6L9 17l-5-5" />
            </g>
          </svg>
        </Icon>
      ),
    }),
  error: (opts: any) =>
    addToast({
      ...opts,
      icon: (
        <Icon>
          <svg height={20} viewBox="0 0 24 24" width={20} className="text-red-600" style={{ color: 'rgb(239 68 68)' }}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
              <path d="M18 6L6 18M6 6l12 12" />
            </g>
          </svg>
        </Icon>
      ),
    }),
  warn: (opts: any) =>
    addToast({
      ...opts,
      icon: (
        <Icon>
          <svg height={20} viewBox="0 0 24 24" width={20} className="text-yellow-600" style={{ color: 'rgb(234 179 8)' }}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </g>
          </svg>
        </Icon>
      ),
    }),
  info: (opts: any) =>
    addToast({
      ...opts,
      icon: (
        <Icon>
          <svg height={20} viewBox="0 0 24 24" width={20} className="text-blue-600" style={{ color: 'rgb(37 99 235)' }}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
              <path d="M12 8h.01" />
              <path d="M11 12h1v4h1" />
              <circle cx="12" cy="12" r="9" />
            </g>
          </svg>
        </Icon>
      ),
    }),
};

export default toast;
