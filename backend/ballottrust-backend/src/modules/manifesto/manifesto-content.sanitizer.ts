import { Injectable } from '@nestjs/common';
import { FilterXSS, type IFilterXSSOptions } from 'xss';

/**
 * Manifesto content is author-supplied rich text that the public portal
 * renders as HTML, so it is an XSS sink. Everything outside a
 * conservative formatting allowlist is removed: no scripts, styles,
 * iframes, event handlers, or `javascript:` URLs survive.
 *
 * Sanitising on write rather than on render means the stored value is
 * always safe, so a future consumer that forgets to escape cannot
 * reintroduce the hole.
 *
 * `xss` is used in preference to `sanitize-html` because it is pure
 * CommonJS with no ESM-only transitive dependencies, which keeps it
 * loadable by this project's Jest/ts-jest toolchain without build
 * workarounds — and because it currently carries no open advisories.
 */
@Injectable()
export class ManifestoContentSanitizer {
  private readonly filter: FilterXSS;

  private readonly plainTextFilter: FilterXSS;

  constructor() {
    const options: IFilterXSSOptions = {
      whiteList: {
        p: [],
        br: [],
        strong: [],
        b: [],
        em: [],
        i: [],
        u: [],
        s: [],
        blockquote: [],
        ul: [],
        ol: [],
        li: [],
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
        hr: [],
        code: [],
        pre: [],
        table: [],
        thead: [],
        tbody: [],
        tr: [],
        th: ['colspan', 'rowspan'],
        td: ['colspan', 'rowspan'],
        a: ['href', 'title', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
      },

      // Remove tags outside the allowlist entirely rather than escaping
      // them. Escaped markup is inert, but it leaves attacker-authored
      // text like `<svg onload=...>` visible in the manifesto body, and
      // any consumer that later unescapes it would reintroduce the hole.
      stripIgnoreTag: true,

      // Drop the *contents* of these tags too, not just the tags —
      // otherwise the script body survives as visible text.
      stripIgnoreTagBody: [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'form',
        'meta',
        'link',
        'svg',
        'math',
      ],

      // No `style` attribute anywhere: it permits url()/expression()
      // payloads in older renderers and a manifesto has no need of it.
      css: false,

      onTagAttr: (tag, name, value) => {
        if (name === 'href') {
          return this.isSafeUrl(value, ['http:', 'https:', 'mailto:'])
            ? `href="${escapeAttr(value)}"`
            : '';
        }

        if (name === 'src') {
          // Images may carry a data: URI so a pasted screenshot survives,
          // but that scheme is never allowed as a link target.
          return this.isSafeUrl(value, ['http:', 'https:', 'data:'])
            ? `src="${escapeAttr(value)}"`
            : '';
        }

        // Anything opening a new tab must not reach back via window.opener.
        if (tag === 'a' && name === 'rel') {
          return 'rel="noopener noreferrer nofollow"';
        }

        return undefined;
      },
    };

    this.filter = new FilterXSS(options);

    this.plainTextFilter = new FilterXSS({
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }

  sanitize(content: string): string {
    const cleaned = this.filter.process(content);

    // `rel` is only rewritten when the author supplied one, so add it to
    // any link that opens a new tab but arrived without it.
    return cleaned.replace(
      /<a (?![^>]*\brel=)([^>]*\btarget=)/g,
      '<a rel="noopener noreferrer nofollow" $1',
    );
  }

  /** Plain-text projection, used for summaries and search. */
  toPlainText(content: string): string {
    return decodeBasicEntities(this.plainTextFilter.process(content))
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isSafeUrl(value: string, allowedSchemes: string[]): boolean {
    const trimmed = value.trim();

    // A scheme-relative or path-relative URL carries no scheme to abuse.
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return true;
    }

    const scheme = trimmed.slice(0, trimmed.indexOf(':') + 1).toLowerCase();

    return allowedSchemes.includes(scheme);
  }
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}
