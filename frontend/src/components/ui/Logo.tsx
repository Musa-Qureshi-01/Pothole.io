import { cn } from '../../lib/utils';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    iconSize?: number; // kept for backwards compatibility
}

export function Logo({ className, iconSize, ...props }: LogoProps) {
    return (
        <div className={cn("relative flex items-center justify-center shrink-0", className)} {...props}>
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* Main Stylized R in primary theme color */}
                <path
                    d="M50 160V55C50 46.7157 56.7157 40 65 40H115C139.853 40 160 60.1472 160 85C160 104.991 146.967 121.933 129 127.632L158.4 160H118.8L93.6 130H70V160H50Z"
                    fill="currentColor"
                    className="text-[#0c3f72] dark:text-white"
                />
                
                {/* Curved road inside the R leg/loop */}
                <path
                    d="M58 152C75 125 105 95 136 85"
                    stroke="white"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    className="stroke-white dark:stroke-slate-900"
                />
                
                {/* Dashed center line of the road */}
                <path
                    d="M58 152C75 125 105 95 136 85"
                    stroke="#0c3f72"
                    strokeWidth="2"
                    strokeDasharray="5,6"
                    strokeLinecap="round"
                    fill="none"
                    className="stroke-[#0c3f72] dark:stroke-white"
                />

                {/* Orange pin location marker (#f29815) */}
                <path
                    d="M125 65C125 51.1929 136.193 40 150 40C163.807 40 175 51.1929 175 65C175 80 150 105 150 105C150 105 125 80 125 65Z"
                    fill="#f29815"
                />
                
                {/* Pin center dot */}
                <circle cx="150" cy="65" r="7" fill="white" className="fill-white dark:fill-slate-900" />
            </svg>
        </div>
    );
}
