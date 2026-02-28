import { AiToolsData } from "../assets/assets"
import { BentoCard, BentoGrid } from "./ui/bento-grid"
import { Eraser, FileText, Hash, Image, Scissors, SquarePen } from "lucide-react"

const features = [
  {
    Icon: Hash,
    name: "Blog Title Generator",
    description: "Find the perfect, catchy title for your blog posts with our AI-powered generator.",
    href: "/ai/blog-titles",
    cta: "Learn More",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Image,
    name: "AI Image Generation",
    description: "Create stunning visuals with our AI image generation tool.",
    href: "/ai/generate-images",
    cta: "Learn More",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: SquarePen,
    name: "AI Article Writer",
    description: "Generate high-quality, engaging articles on any topic with our AI technology.",
    href: "/ai/write-article",
    cta: "Learn More",
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: FileText,
    name: "Resume Reviewer",
    description: "Get your resume reviewed by AI to improve your chances of success.",
    href: "/ai/review-resume",
    cta: "Learn More",
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
  {
    Icon: Eraser,
    name: "Background Removal",
    description: "Effortlessly remove backgrounds from your images with AI.",
    href: "/ai/remove-background",
    cta: "Learn More",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Scissors,
    name: "Object Removal",
    description: "Remove unwanted objects from your images seamlessly.",
    href: "/ai/remove-object",
    cta: "Learn More",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function BentoDemo() {
  return (
    <div className="py-12">
      <BentoGrid>
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}

