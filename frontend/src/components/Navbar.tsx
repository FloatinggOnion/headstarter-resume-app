import { SiGithub } from 'react-icons/si'

import Logo from '/logo.svg'

type Props = {
  className?: string;
}

const Navbar = (props: Props) => {
  return (
    <header className={`w-[100vw] py-4 px-8 md:py-4 md:px-32 shadow-custom flex justify-between items-center ${props.className}`}>
        <a href="/">
          <div className="flex items-center gap-4">
              <img src={Logo} alt="Resumend Logo" className='w-12 h-12' />
              <h1 className='font-bold text-xl'>Resumend</h1>
          </div>
        </a>
        <a href="https://github.com/FloatinggOnion/headstarter-resume-app">
            <SiGithub className='text-2xl' />
        </a>
    </header>
  )
}

export default Navbar