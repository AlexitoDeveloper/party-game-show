import React, { useMemo } from 'react';
import { parseEmojiToHtml } from '../lib/twemoji';

export type TwemojiElementTag = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'label';

interface TwemojiTextProps {
  children: string;
  className?: string;
  as?: TwemojiElementTag;
}

/**
 * TwemojiText: Componente para renderizar textos con emojis vectoriales idénticos en TV, iOS y Android.
 */
export const TwemojiText: React.FC<TwemojiTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
}) => {
  const htmlContent = useMemo(() => {
    return parseEmojiToHtml(children);
  }, [children]);

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
