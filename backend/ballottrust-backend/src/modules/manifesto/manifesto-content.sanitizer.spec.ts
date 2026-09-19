import { ManifestoContentSanitizer } from './manifesto-content.sanitizer';

describe('ManifestoContentSanitizer', () => {
  let sanitizer: ManifestoContentSanitizer;

  beforeEach(() => {
    sanitizer = new ManifestoContentSanitizer();
  });

  describe('sanitize', () => {
    it('keeps ordinary formatting intact', () => {
      const input =
        '<h2>Plan</h2><p>We will <strong>improve</strong> the <em>library</em>.</p><ul><li>One</li></ul>';

      expect(sanitizer.sanitize(input)).toBe(input);
    });

    it('strips script tags and their contents', () => {
      const result = sanitizer.sanitize(
        '<p>Vote</p><script>fetch("/steal")</script>',
      );

      expect(result).toBe('<p>Vote</p>');
      expect(result).not.toContain('fetch');
    });

    it('strips inline event handlers', () => {
      const result = sanitizer.sanitize('<p onclick="steal()">Vote</p>');

      expect(result).toBe('<p>Vote</p>');
    });

    it('strips javascript: URLs from links', () => {
      const result = sanitizer.sanitize(
        '<a href="javascript:alert(1)">click</a>',
      );

      expect(result).not.toContain('javascript:');
    });

    it('strips iframes', () => {
      expect(sanitizer.sanitize('<iframe src="http://evil"></iframe>')).toBe(
        '',
      );
    });

    it('strips style attributes', () => {
      const result = sanitizer.sanitize(
        '<p style="background:url(javascript:alert(1))">x</p>',
      );

      expect(result).toBe('<p>x</p>');
    });

    it('adds rel=noopener to links so target=_blank cannot reach window.opener', () => {
      const result = sanitizer.sanitize(
        '<a href="https://example.com" target="_blank">x</a>',
      );

      expect(result).toContain('rel="noopener noreferrer nofollow"');
    });

    it('permits http, https and mailto links', () => {
      expect(sanitizer.sanitize('<a href="https://x.com">a</a>')).toContain(
        'https://x.com',
      );
      expect(sanitizer.sanitize('<a href="mailto:a@x.com">a</a>')).toContain(
        'mailto:a@x.com',
      );
    });

    it('permits data: URIs on images but not on links', () => {
      const img = sanitizer.sanitize(
        '<img src="data:image/png;base64,AAAA" alt="x" />',
      );
      expect(img).toContain('data:image/png');

      const link = sanitizer.sanitize(
        '<a href="data:text/html,<script>alert(1)</script>">x</a>',
      );
      expect(link).not.toContain('data:text/html');
    });

    it('leaves plain text untouched', () => {
      expect(sanitizer.sanitize('Just words')).toBe('Just words');
    });

    it('handles empty input', () => {
      expect(sanitizer.sanitize('')).toBe('');
    });
  });

  describe('toPlainText', () => {
    it('removes all markup and collapses whitespace', () => {
      expect(
        sanitizer.toPlainText('<h1>Title</h1>\n\n<p>Body   text</p>'),
      ).toBe('Title Body text');
    });
  });
});

describe('ManifestoContentSanitizer — adversarial input', () => {
  let sanitizer: ManifestoContentSanitizer;

  beforeEach(() => {
    sanitizer = new ManifestoContentSanitizer();
  });

  const mustNotExecute = (result: string) => {
    expect(result.toLowerCase()).not.toMatch(/<script/);
    expect(result.toLowerCase()).not.toMatch(/javascript:/);
    expect(result.toLowerCase()).not.toMatch(/\son\w+\s*=/);
    expect(result.toLowerCase()).not.toMatch(/<iframe/);
  };

  it.each([
    ['uppercase tag', '<SCRIPT>alert(1)</SCRIPT>'],
    ['mixed-case scheme', '<a href="JaVaScRiPt:alert(1)">x</a>'],
    ['whitespace-padded scheme', '<a href="  javascript:alert(1)">x</a>'],
    ['tab inside scheme', '<a href="java\tscript:alert(1)">x</a>'],
    ['newline inside scheme', '<a href="java\nscript:alert(1)">x</a>'],
    ['svg onload', '<svg onload="alert(1)"></svg>'],
    ['img onerror', '<img src=x onerror="alert(1)">'],
    ['body onload', '<body onload="alert(1)">hi</body>'],
    ['nested script', '<scr<script>ipt>alert(1)</script>'],
    ['object tag', '<object data="javascript:alert(1)"></object>'],
    ['embed tag', '<embed src="javascript:alert(1)">'],
    [
      'form with formaction',
      '<form><button formaction="javascript:alert(1)">x</button></form>',
    ],
    [
      'meta refresh',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
    ],
    ['link stylesheet', '<link rel="stylesheet" href="javascript:alert(1)">'],
    [
      'style block',
      '<style>body{background:url("javascript:alert(1)")}</style>',
    ],
    [
      'data html link',
      '<a href="data:text/html,<script>alert(1)</script>">x</a>',
    ],
    ['vbscript scheme', '<a href="vbscript:msgbox(1)">x</a>'],
    ['null byte in scheme', '<a href="java\0script:alert(1)">x</a>'],
  ])('neutralises %s', (_name, payload) => {
    mustNotExecute(sanitizer.sanitize(payload));
  });

  it('does not leave the body of a stripped script as visible text', () => {
    const result = sanitizer.sanitize('<p>a</p><script>stealVotes()</script>');

    expect(result).not.toContain('stealVotes');
  });

  it('keeps a legitimate manifesto intact end to end', () => {
    const input =
      '<h2>My Platform</h2>' +
      '<p>I will <strong>extend</strong> library hours.</p>' +
      '<ul><li>More study space</li><li>Longer hours</li></ul>' +
      '<p>See <a href="https://example.edu/plan">the full plan</a>.</p>';

    const result = sanitizer.sanitize(input);

    expect(result).toContain('<h2>My Platform</h2>');
    expect(result).toContain('<strong>extend</strong>');
    expect(result).toContain('<li>More study space</li>');
    expect(result).toContain('https://example.edu/plan');
  });

  it('permits relative and protocol-relative links', () => {
    expect(sanitizer.sanitize('<a href="/about">x</a>')).toContain('/about');
    expect(sanitizer.sanitize('<a href="//example.com">x</a>')).toContain(
      '//example.com',
    );
  });

  it('is idempotent — sanitising twice changes nothing further', () => {
    const once = sanitizer.sanitize(
      '<p onclick="x()">hi</p><script>bad()</script>',
    );

    expect(sanitizer.sanitize(once)).toBe(once);
  });
});
