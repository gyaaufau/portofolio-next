import Link from "next/link";
import { PixelOrnament } from "@/components/pixel-ornament";

export default function NotFound() {
  return <main id="main-content" className="mx-auto grid min-h-[70dvh] max-w-[900px] place-items-center px-5"><div className="flex flex-col items-center"><div className="pixel-frame pixel-grid relative z-10 max-w-xl bg-card p-8 md:p-12"><p className="text-pixel text-[9px] text-primary">ROOM 404</p><h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em]">Nothing spawned here.</h1><p className="mt-4 leading-7 text-muted-foreground">The page may have moved, or the address may be incomplete.</p><Link href="/" className="pixel-button mt-7 bg-primary text-primary-foreground">Return home</Link></div><PixelOrnament name="mossy-masonry-vine" className="-mt-10 w-32 self-start md:-mt-16 md:w-64" /></div></main>;
}
