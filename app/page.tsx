import { redirect } from "next/navigation"

// Dev convenience: the port lives at /font, as on Cal.com. Not part of the drop-in.
export default function Home() {
    redirect("/font")
}
