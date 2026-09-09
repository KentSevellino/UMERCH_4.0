import Navbar from '../components/layouts/Navbar';
import Footer from '../components/layouts/Footer';
import Logo from '../assets/images/UMERCH-LOGO.svg';

const DefaultAvatar = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="50" cy="50" r="50" fill="#e5e7eb" />
        <circle cx="50" cy="38" r="16" fill="#9ca3af" />
        <ellipse cx="50" cy="85" rx="28" ry="20" fill="#9ca3af" />
    </svg>
);

interface Developer {
    name: string;
    role: string;
    photo: string | null;
}

const developers: Developer[] = [
    {
        name: 'Mheil Andrei Cenita',
        role: 'Front End Developer',
        photo: null,
    },
    {
        name: 'Yosh Batula',
        role: 'Full Stack Developer',
        photo: null,
    },
    {
        name: 'Ken Sevellino',
        role: 'Back End Developer',
        photo: null,
    },
    {
        name: 'John Vincent Oclarit',
        role: 'Founder of UMERCH',
        photo: null,
    },
];

export default function AboutUsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F6F6F6] font-montserrat">
            <Navbar />

            {/* Hero Banner */}
            <div className="bg-[#9C0306] text-white py-20 px-6 flex flex-col items-center text-center">
                <img src={Logo} alt="UMerch Logo" className="w-40 mb-6 brightness-0 invert" />
                <h1 className="text-4xl font-extrabold tracking-wide uppercase">About Us</h1>
                <div className="mt-3 w-16 h-1 bg-[#FFB600] rounded-full"></div>
                <p className="mt-6 text-white/80 max-w-xl text-base leading-relaxed">
                    UMerch is the official University of Mindanao merchandise platform bringing university spirit
                    to every student, faculty, and supporter through quality apparel and accessories.
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="py-16 px-6 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm p-8 border-t-4 border-[#9C0306]">
                    <h2 className="text-xl font-bold text-[#9C0306] uppercase tracking-wide mb-3">Our Mission</h2>
                    <p className="text-[#727272] text-sm leading-relaxed">
                        The UM Merchandise Store is committed to serving students, employees, and alumni with reliable products, transparent and efficient service, while adapting modern management solutions.
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-8 border-t-4 border-[#FFB600]">
                    <h2 className="text-xl font-bold text-[#FFB600] uppercase tracking-wide mb-3">Our Vision</h2>
                    <p className="text-[#727272] text-sm leading-relaxed">
                        To provide quality, affordable, and authentic University of Mindanao merchandise that fosters school pride and accessibility for the UM community.
                    </p>
                </div>
            </div>

            {/* Meet the Team */}
            <div className="pb-20 px-6 max-w-5xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-[#9C0306] uppercase tracking-wide">Meet the Team</h2>
                    <div className="mt-2 mx-auto w-16 h-1 bg-[#FFB600] rounded-full"></div>
                    <p className="mt-4 text-[#727272] text-sm">The developers behind UMERCH</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {developers.map((dev) => (
                        <div
                            key={dev.name}
                            className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full overflow-hidden mb-5 shadow-md border-4 border-[#9C0306]">
                                {dev.photo ? (
                                    <img
                                        src={dev.photo}
                                        alt={dev.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <DefaultAvatar />
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="text-[17px] font-bold text-gray-800">{dev.name}</h3>

                            {/* Role badge */}
                            <span className="mt-2 inline-block px-3 py-1 bg-[#FFB600]/15 text-[#9C0306] text-xs font-semibold rounded-full uppercase tracking-wide">
                                {dev.role}
                            </span>

                            {/* Divider */}
                            <div className="mt-4 w-10 h-0.5 bg-[#FFB600] rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
