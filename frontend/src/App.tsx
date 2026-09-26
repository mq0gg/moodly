import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Section } from './components/Section';
import { BrowseSection } from './components/BrowseSection';
import styles from './App.module.css';

/**
 * Single-page shell (B-06). Browse recipes is wired to the backend with
 * search, tag filters, and an in-place detail view (B-07\u2013B-09).
 * The remaining sections are still structural placeholders, filled in
 * B-12 onward. Section order and ids match the SOW: Browse, SipSense
 * Quiz, Result, Suggest a Recipe, Experience, About, Footer.
 */
function App() {
  return (
    <>
      <a href="#browse" className={styles.skipLink}>
        Skip to content
      </a>
      <div id="top" />
      <Header />

      <main>
        <div className={styles.intro}>
          <h1 className={styles.introHeading}>Drinks that match your mood</h1>
          <p className={styles.introSub}>
            Coffee, matcha, and fresh halal drinks — take a short quiz and find your next sip, with a reason why it
            fits.
          </p>
        </div>

        <Section id="browse" title="Browse recipes" variant="block">
          <BrowseSection />
        </Section>

        <Section id="quiz" title="SipSense mood quiz">
          <p>A short quiz recommends your drink. Coming in B-12–B-17.</p>
        </Section>

        <Section id="result" title="Your match" variant="block">
          <p>Top pick plus two alternates, each with a reason it matched. Coming in B-12–B-17.</p>
        </Section>

        <Section id="suggest" title="Suggest a recipe">
          <p>Share a recipe of your own — no account needed. Coming in B-18–B-20.</p>
        </Section>

        <Section id="experience" title="Experience" variant="block">
          <p>Read what others thought, or leave your own note. Coming in B-21–B-22.</p>
        </Section>

        <Section id="about" title="About Moodly">
          <p>
            Moodly recommends coffee, matcha, and fresh halal drinks based on how you feel — not just what&rsquo;s
            popular. Every match comes with a plain-language reason, built from a short, editable quiz.
          </p>
        </Section>
      </main>

      <Footer />
    </>
  );
}

export default App;
