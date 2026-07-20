import Image from "next/image";

interface AboutProps {
  paragraphs: string[];
  skills?: string[];
  tech?: string[];
  softSkills?: string[];
  photo: { src: string; alt: string; width: number; height: number };
}

function ItemGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-pixel text-[9px] text-primary">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded-[4px] border border-border bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">{item}</span>)}
      </div>
    </div>
  );
}

export function About({ paragraphs, skills = [], tech = [], softSkills = [], photo }: AboutProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="pixel-frame relative min-h-[360px] overflow-hidden bg-card">
        <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" />
      </div>
      <div className="pixel-frame pixel-grid bg-card p-6 md:p-8">
        {paragraphs.map((paragraph) => <p key={paragraph} className="max-w-[62ch] text-lg leading-8">{paragraph}</p>)}
        <div className="mt-9 grid gap-8 md:grid-cols-2">
          <ItemGroup title="CORE KIT" items={skills} />
          <ItemGroup title="TOOLS" items={tech} />
          <div className="md:col-span-2"><ItemGroup title="PARTY SKILLS" items={softSkills} /></div>
        </div>
      </div>
    </div>
  );
}
