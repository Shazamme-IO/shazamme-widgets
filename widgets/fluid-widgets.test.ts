// The Consultant, Job Feed 2026 and Testimonials legacy ports size their cards from the
// container width, not from a device flag read once at load. These source and bundle guards
// keep that from regressing; the layout itself is proven against the live WOW page.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version as string;
const src = (w: string) => readFileSync(join(here, w, 'legacy.js'), 'utf8');
const bundle = (w: string) => readFileSync(join(here, '..', 'dist', w, VERSION, 'widget.min.js'), 'utf8');

describe.each(['consultant', 'job-feed-2026', 'testimonials'])('%s is container-fluid', (widget) => {
  it('re-fits on width changes through a ResizeObserver', () => {
    expect(src(widget)).toContain('new ResizeObserver');
    expect(bundle(widget)).toContain('ResizeObserver');
  });

  it('overrides pinned site CSS with inline !important and follows the real content height', () => {
    expect(src(widget)).toContain("'important'");
    expect(src(widget)).toContain("closest('.widget-wrapper')");
  });
});

describe('consultant', () => {
  it('no longer collapses to one slide at a fixed 800px viewport breakpoint', () => {
    const slider = src('consultant').match(/function slider\(\)\{[\s\S]*?\n\}/)![0];
    expect(slider).not.toContain('responsive');
    expect(src('consultant')).toContain('fluidColumns()');
  });

  it('turns <br> in names and titles into spaces so they wrap with the card', () => {
    const body = src('consultant').match(/function oneLine\(text\)\{[\s\S]*?\n\}/)![0];
    const oneLine = new Function(`${body}; return oneLine;`)() as (t: unknown) => string;
    expect(oneLine('General <br> Manager')).toBe('General Manager');
    expect(oneLine('Emily <br>Angeloni (McLeod)')).toBe('Emily Angeloni (McLeod)');
    expect(oneLine(null)).toBe('');
  });
});

describe('consultant round 3', () => {
  it('draws every portrait as a circle sized from its card, in every layout', () => {
    const body = src('consultant');
    expect(body).toContain('function fluidPortraits()');
    expect(body).toContain("'border-radius': '50%'");
    expect(body.match(/fluidPortraits\(\)/g)!.length).toBeGreaterThanOrEqual(4);
  });

  it('lays the grid out centred with no lone card on the last row', () => {
    const body = src('consultant');
    expect(body).toContain('function fluidGrid()');
    expect(body).toContain('count % columns === 1');
    expect(body).toContain("'justify-content': 'center'");
  });

  it('cancels the position:relative left nudge site CSS puts on cards', () => {
    expect(src('consultant')).toContain("'left': '0'");
  });
});

describe('job-feed-2026', () => {
  it('centres a lone card', () => {
    expect(src('job-feed-2026')).toContain("slides.length < (slides.options.perPage || 1) ? 'center'");
  });

  it('picks cards per view from the track width, not from data.device', () => {
    expect(src('job-feed-2026')).toContain('perPage: sender.fluidPerPage(splideEl)');
    expect(src('job-feed-2026')).not.toContain('slidePerPageTablet');
    expect(src('job-feed-2026')).not.toContain("data.device === 'mobile'");
  });

  it('keeps the live v131 multi-value custom field filter', () => {
    expect(src('job-feed-2026')).toContain('isAnyValue');
  });
});

describe('testimonials', () => {
  it('wraps every card so the slide is the full slot and the gap is padding', () => {
    expect(src('testimonials')).toContain('function wrapCards(slider)');
    expect(src('testimonials')).not.toContain('shmGapped');
  });

  it('snaps the track to the current slide after a re-fit, with autoplay paused meanwhile', () => {
    const body = src('testimonials');
    expect(body).toContain('function settleSlider(track)');
    expect(body).toContain("slick.disableTransition()");
    expect(body).toContain("track.slick('slickPause')");
    expect(body).toContain("track.slick('slickPlay')");
  });

  it('opts the slider out of the site one-slide fallback and no longer reads data.device for slides', () => {
    expect(src('testimonials')).toContain('main-review-slider-container');
    expect(src('testimonials')).toContain('slidesToShow: fluidColumns()');
  });
});
