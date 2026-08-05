import { Hero } from '../sections/Hero.jsx'
import { Work } from '../sections/Work.jsx'
import { About } from '../sections/About.jsx'
import { Experience } from '../sections/Experience.jsx'
import { Contact } from '../sections/Contact.jsx'
import { SectionRail } from '../components/SectionRail.jsx'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <Hero />
      <Work />
      <About />
      <Experience />
      <Contact />
      <SectionRail />
    </div>
  )
}
