'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { SiteImage } from '../components/SiteImage';

const MENU_PAGES = [
  {
    id: 'starters',
    title: 'Starters',
    subtitle: 'To begin',
    items: [
      { name: 'Country loaf', desc: 'Cultured butter, smoked salt', price: '9', note: 'V' },
      { name: 'Roasted beet salad', desc: 'Whipped goat cheese, hazelnut, bitter greens', price: '16', note: 'GF' },
      { name: 'Wood-fired oysters', desc: 'Chili butter, lemon thyme, grilled bread', price: '21' },
      { name: 'Beef tartare', desc: 'Cured yolk, crisp shallot, mustard seed', price: '19' },
      { name: 'Charred asparagus', desc: 'Brown butter, bottarga, lemon', price: '18', note: 'GF' },
      { name: 'Soup of the day', desc: 'Ask your server for tonight’s pot', price: '14' },
    ],
  },
  {
    id: 'mains',
    title: 'Mains',
    subtitle: 'From the hearth',
    items: [
      { name: 'Dry-aged ribeye', desc: 'Charred alliums, bone marrow jus', price: '58', note: 'GF' },
      { name: 'Market catch', desc: 'Citrus beurre blanc, fennel, new potatoes', price: '42', note: 'GF' },
      { name: 'Hand-cut pasta', desc: 'Wild mushroom ragù, aged pecorino', price: '34', note: 'V' },
      { name: 'Half chicken', desc: 'Herb jus, roasted carrots, pan drippings', price: '36' },
      { name: 'Lamb shoulder', desc: 'Slow-braised, yogurt, mint, flatbread', price: '44' },
      { name: 'Cauliflower steak', desc: 'Romesco, toasted almonds, herbs', price: '28', note: 'VG' },
    ],
  },
  {
    id: 'sides',
    title: 'Sides',
    subtitle: 'For the table',
    items: [
      { name: 'Crispy potatoes', desc: 'Rosemary salt, aioli', price: '12', note: 'V' },
      { name: 'Market greens', desc: 'Citrus vinaigrette', price: '11', note: 'VG' },
      { name: 'Grilled mushrooms', desc: 'Garlic confit, thyme', price: '13', note: 'VG' },
      { name: 'Charred broccolini', desc: 'Chili, lemon', price: '12', note: 'VG' },
    ],
  },
  {
    id: 'sweets',
    title: 'Sweets',
    subtitle: 'To finish',
    items: [
      { name: 'Olive oil cake', desc: 'Citrus curd, pistachio praline', price: '14', note: 'V' },
      { name: 'Dark chocolate tart', desc: 'Sea salt, crème fraîche', price: '15', note: 'V' },
      { name: 'Seasonal sorbet', desc: 'Three scoops, herb syrup', price: '12', note: 'VG' },
      { name: 'Cheese board', desc: 'Three cheeses, honey, walnut bread', price: '18', note: 'V' },
    ],
  },
  {
    id: 'drinks',
    title: 'Drinks',
    subtitle: 'Bar & cellar',
    items: [
      { name: 'House negroni', desc: 'Gin, vermouth, bitter, orange', price: '15' },
      { name: 'Smoked old fashioned', desc: 'Rye, demerara, bitters', price: '16' },
      { name: 'Seasonal spritz', desc: 'Sparkling wine, citrus, bitter', price: '14' },
      { name: 'Natural white', desc: 'Glass · ask for tonight’s bottle', price: '13' },
      { name: 'Pinot noir', desc: 'Willamette Valley · glass', price: '15' },
      { name: 'Espresso / tea', desc: 'After dinner', price: '5' },
    ],
  },
] as const;

const NAV_LINKS = [
  { href: '#menu', id: 'menu', label: 'Menu' },
  { href: '#story', id: 'story', label: 'Our story' },
  { href: '#plates', id: 'plates', label: 'Plates' },
  { href: '#visit', id: 'visit', label: 'Visit' },
] as const;

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [menuPage, setMenuPage] = useState(MENU_PAGES[0].id);
  const [sent, setSent] = useState(false);
  const menuTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      Boolean
    ) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0.1, 0.35, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.reveal'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.16 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  function onReserve(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function scrollMenuTo(id: string) {
    const track = menuTrackRef.current;
    const page = track?.querySelector<HTMLElement>(`[data-menu-page="${id}"]`);
    if (!track || !page) return;
    track.scrollTo({ left: page.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    setMenuPage(id);
  }

  function onMenuScroll() {
    const track = menuTrackRef.current;
    if (!track) return;
    const pages = Array.from(track.querySelectorAll<HTMLElement>('[data-menu-page]'));
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = pages[0];
    let best = Infinity;
    pages.forEach((page) => {
      const mid = page.offsetLeft - track.offsetLeft + page.clientWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < best) {
        best = dist;
        closest = page;
      }
    });
    const id = closest?.dataset.menuPage;
    if (id) setMenuPage(id);
  }

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <a className="brand" href="#top" onClick={closeMenu}>
          Hearth &amp; Vale
        </a>
        <nav className="nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={active === link.id ? 'is-active' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-cta" href="#reserve" onClick={closeMenu}>
            Reserve
          </a>
          <button
            type="button"
            className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav
        className={`mobile-nav${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={active === link.id ? 'is-active' : undefined}
            onClick={closeMenu}
          >
            {link.label}
          </a>
        ))}
        <a className="mobile-cta" href="#reserve" onClick={closeMenu}>
          Reserve a table
        </a>
      </nav>

      <main id="top">
        <section className="hero" aria-label="Hearth & Vale">
          <div className="hero-media">
            <SiteImage
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80"
              alt="Warm restaurant dining room with set tables"
              fill
              priority
              sizes="100vw"
              className=""
            />
          </div>
          <div className="hero-veil" aria-hidden="true" />
          <div className="hero-content">
            <h1 className="hero-brand">Hearth &amp; Vale</h1>
            <p className="hero-line">
              Seasonal cooking in a room built for long evenings — menus, reservations, and a table waiting for you.
            </p>
            <div className="hero-actions">
              <a className="btn-primary" href="#reserve">
                Book a table
              </a>
              <a className="btn-ghost" href="#menu">
                View the menu
              </a>
            </div>
          </div>
        </section>

        <section className="section menu-section" id="menu">
          <div className="section-inner reveal">
            <div className="menu-intro">
              <div>
                <p className="section-kicker">The menu</p>
                <h2 className="section-title">Tonight’s kitchen</h2>
                <p className="section-copy">
                  A living dinner menu — swipe or scroll sideways through each course, like turning pages at the table.
                </p>
              </div>
              <p className="menu-legend" aria-label="Dietary notes">
                <span>V vegetarian</span>
                <span>VG vegan</span>
                <span>GF gluten-free</span>
              </p>
            </div>

            <div className="menu-book">
              <div className="menu-tabs" role="tablist" aria-label="Menu courses">
                {MENU_PAGES.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    role="tab"
                    aria-selected={menuPage === page.id}
                    className={`menu-tab${menuPage === page.id ? ' is-active' : ''}`}
                    onClick={() => scrollMenuTo(page.id)}
                  >
                    {page.title}
                  </button>
                ))}
              </div>

              <div
                className="menu-track"
                ref={menuTrackRef}
                onScroll={onMenuScroll}
                tabIndex={0}
                aria-label="Scrollable dinner menu"
              >
                {MENU_PAGES.map((page, index) => (
                  <article
                    className="menu-page"
                    key={page.id}
                    data-menu-page={page.id}
                    aria-label={`${page.title} menu page`}
                  >
                    <header className="menu-page-head">
                      <p className="menu-page-index">
                        {String(index + 1).padStart(2, '0')} / {String(MENU_PAGES.length).padStart(2, '0')}
                      </p>
                      <h3>{page.title}</h3>
                      <p>{page.subtitle}</p>
                    </header>
                    <div className="menu-page-body">
                      {page.items.map((item) => (
                        <div className="menu-item" key={item.name}>
                          <div className="menu-item-top">
                            <h4>{item.name}</h4>
                            <span className="menu-dots" aria-hidden="true" />
                            <span className="menu-price">${item.price}</span>
                          </div>
                          <p>
                            {item.desc}
                            {'note' in item && item.note ? (
                              <em className="menu-note"> · {item.note}</em>
                            ) : null}
                          </p>
                        </div>
                      ))}
                    </div>
                    <footer className="menu-page-foot">Hearth &amp; Vale · dinner</footer>
                  </article>
                ))}
              </div>

              <p className="menu-scroll-hint">Scroll sideways to browse courses →</p>
            </div>
          </div>
        </section>

        <section className="section" id="story">
          <div className="section-inner story reveal">
            <div className="story-media">
              <SiteImage
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1400&q=80"
                alt="Chef plating a dish in the kitchen"
                fill
                sizes="(max-width: 720px) 100vw, 50vw"
              />
            </div>
            <div className="story-copy">
              <p className="section-kicker">Our story</p>
              <h2 className="section-title">Cooked over fire, finished with care</h2>
              <p className="section-copy">
                Hearth &amp; Vale is a neighborhood restaurant built for the rhythm Squarespace restaurant templates
                are known for: clear navigation, a beautiful menu, and an easy path to reserve.
              </p>
              <p className="section-copy">
                We source from nearby farms, bake our own bread, and keep the dining room intimate — so every plate
                arrives with the same quiet attention you see in the best restaurant sites.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="plates">
          <div className="section-inner reveal">
            <p className="section-kicker">From the pass</p>
            <h2 className="section-title">Plates worth photographing</h2>
            <p className="section-copy">
              Showcase signature dishes with full-bleed photography — the same approach used across modern restaurant
              website templates.
            </p>
            <div className="plates">
              <figure className="plate">
                <SiteImage
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
                  alt="Fine dining table setting with plated courses"
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                />
                <figcaption className="plate-label">Dining room</figcaption>
              </figure>
              <figure className="plate">
                <SiteImage
                  src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80"
                  alt="Seared steak with herbs"
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                />
                <figcaption className="plate-label">Dry-aged ribeye</figcaption>
              </figure>
              <figure className="plate">
                <SiteImage
                  src="https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=1200&q=80"
                  alt="Cocktail on a dark bar top"
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                />
                <figcaption className="plate-label">Bar program</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="section reserve" id="reserve">
          <div className="reserve-shell reveal">
            <div className="reserve-visual">
              <SiteImage
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80"
                alt="Dimly lit restaurant bar ready for evening service"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <div className="reserve-visual-veil" aria-hidden="true" />
              <div className="reserve-visual-copy">
                <p className="section-kicker">Tonight</p>
                <h2 className="reserve-visual-title">A quieter table, a longer evening</h2>
                <ul className="reserve-perks">
                  <li>Open kitchen · seasonal tasting notes</li>
                  <li>Counter seats for walk-ins after 9</li>
                  <li>Private corner for 6–8 guests</li>
                </ul>
              </div>
            </div>

            <div className="reserve-panel">
              <p className="section-kicker">Reservations</p>
              <h2 className="section-title">Request your seating</h2>
              <p className="section-copy">
                Tell us when you’d like to dine — we’ll confirm by email within a few hours.
              </p>

              {sent ? (
                <div className="reserve-success" role="status">
                  <p className="reserve-success-title">You’re on the list</p>
                  <p>
                    Thanks — we received your request and will confirm shortly. Questions? Call{' '}
                    <a href="tel:+15035550192">(503) 555-0192</a>.
                  </p>
                </div>
              ) : (
                <form className="reserve-form" onSubmit={onReserve}>
                  <div className="reserve-row">
                    <label>
                      Name
                      <input name="name" type="text" required autoComplete="name" placeholder="Alex Rivera" />
                    </label>
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="alex@email.com"
                      />
                    </label>
                  </div>

                  <div className="reserve-row">
                    <label>
                      Party size
                      <select name="party" defaultValue="2">
                        <option value="1">1 guest</option>
                        <option value="2">2 guests</option>
                        <option value="3">3 guests</option>
                        <option value="4">4 guests</option>
                        <option value="5">5 guests</option>
                        <option value="6">6+ guests</option>
                      </select>
                    </label>
                    <label>
                      Preferred date
                      <input name="date" type="date" required />
                    </label>
                  </div>

                  <fieldset className="reserve-times">
                    <legend>Preferred time</legend>
                    <div className="reserve-time-grid" role="group" aria-label="Preferred time">
                      {['5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00'].map((time) => (
                        <label key={time} className="reserve-time">
                          <input type="radio" name="time" value={time} defaultChecked={time === '7:00'} />
                          <span>{time}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label>
                    Notes
                    <textarea name="notes" rows={3} placeholder="Allergies, celebration, timing…" />
                  </label>

                  <div className="reserve-submit">
                    <button className="btn-reserve" type="submit">
                      Confirm request
                    </button>
                    <p className="reserve-note">No payment required · Same-day seats by phone</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="section" id="visit">
          <div className="section-inner reveal">
            <p className="section-kicker">Visit</p>
            <h2 className="section-title">Hours &amp; location</h2>
            <div className="visit-grid">
              <div className="visit-card">
                <h3>Find us</h3>
                <p>
                  418 Vale Street
                  <br />
                  Portland, OR 97209
                </p>
              </div>
              <div className="visit-card">
                <h3>Hours</h3>
                <p>
                  Tue–Thu · 5–10pm
                  <br />
                  Fri–Sat · 5–11pm
                  <br />
                  Sun · 4–9pm
                </p>
              </div>
              <div className="visit-card">
                <h3>Contact</h3>
                <p>
                  <a href="mailto:hello@hearthandvale.example">hello@hearthandvale.example</a>
                  <br />
                  <a href="tel:+15035550192">(503) 555-0192</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Hearth &amp; Vale</span>
        <span>Restaurant site · menu · reservations · visit</span>
      </footer>
    </>
  );
}
