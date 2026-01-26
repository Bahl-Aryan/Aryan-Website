"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./Reveal";

interface UnderTheHoodItem {
  title: string;
  content: string | React.ReactNode;
}

interface UnderTheHoodAccordionProps {
  items: UnderTheHoodItem[];
}

export function UnderTheHoodAccordion({ items }: UnderTheHoodAccordionProps) {
  return (
    <Reveal>
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="display-l text-[var(--text)] mb-6">Under the Hood</h2>
            <Accordion type="single" collapsible className="w-full">
              {items.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-[var(--faint)]"
                >
                  <AccordionTrigger className="text-left text-[var(--text)] hover:text-[var(--accent)]">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--muted)] body">
                    {typeof item.content === "string" ? (
                      <p>{item.content}</p>
                    ) : (
                      item.content
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
