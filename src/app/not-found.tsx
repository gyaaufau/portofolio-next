import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="editorial-state"><span>404</span><h1>Nothing lives at this address.</h1><p>The page may have moved, or the address may be incomplete.</p><Link href="/" className="editorial-button editorial-button-dark">Return home</Link></main>;
}
