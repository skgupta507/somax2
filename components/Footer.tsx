import Link from 'next/link'

const footerMenus = [
    { menu: 'DMCA', href: '/dmca' },
    { menu: '•', href: '' },
    { menu: 'GitHub', href: 'https://github.com/jasondev01/soma-v2.0' },
    { menu: '•', href: '' },
    { menu: 'Terms of Service', href: '/terms' },
]

export default function Footer() {
    return (        
        <footer className='mt-10 h-fit bg-slate-800/60'>
            <div className='container pt-10 pb-5 flex flex-col items-center md:flex-row md:justify-between'>
                <div className='flex-1 flex gap-x-4 flex-wrap justify-center md:justify-start lg:items-center'>
                    <Link href='/' className="block w-fit text-3xl md:text-4xl font-bold tracking-wide">
                        soma-tv.
                    </Link>
                    <p className='text-[11px] text-center md:text-left mt-2 lg:w-1/2'>
                        This website does not store any files on its server. Instead, it offers links to media content hosted on third-party services. <br />
                    </p>
                </div>

                <ul className='flex-1 shrink-0 flex gap-1 flex-wrap flex-row md:flex-col justify-around items-end mt-2 md:mt-0'>
                {footerMenus.map((menu, idx) => (
                    <li key={idx}>
                        <Link
                            href={menu.href}
                            className={`text-xs font-medium hover:text-cyan-300 transition-all ${menu.href ? '' : 'pointer-events-none md:hidden'}`}
                        >
                            {menu.menu}
                        </Link>
                    </li>
                ))}
                </ul>
            </div>
            <div className=' border-t border-slate-300/10'>
                <ul className='container flex gap-2 pt-2 pb-2.5 mt-1 text-xs justify-center md:justify-start items-center'>
                    <li>&copy; soma-tv.</li>
                    <li className='bulletpoints'>•</li>
                    <li>2024</li>
                </ul>
            </div>
        </footer>
    )
}
