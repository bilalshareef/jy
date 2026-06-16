import { Navbar } from './components/Navbar/Navbar'
import { Hero } from './components/Hero/Hero'
import { InstallTabs } from './components/InstallTabs/InstallTabs'
import { PlatformIcons } from './components/PlatformIcons/PlatformIcons'
import { WhyJy } from './components/WhyJy/WhyJy'
import { Features } from './components/Features/Features'
import { Usage } from './components/Usage/Usage'
import { Footer } from './components/Footer/Footer'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <main className={styles.main}>
        <Hero>
          <InstallTabs />
          <PlatformIcons />
        </Hero>
        <WhyJy />
        <Features />
        <Usage />
      </main>
      <Footer />
    </div>
  )
}

export default App
