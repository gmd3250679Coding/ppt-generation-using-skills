import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import annualBusinessAnalysis from "../assets/showcase/annual-business-analysis.png";
import artThemePpt from "../assets/showcase/art-theme-ppt.png";
import quarterlyPerformanceReport from "../assets/showcase/quarterly-performance-report.png";
import strategyPlanningReport from "../assets/showcase/strategy-planning-report.png";

const showcaseItems = [
  {
    image: annualBusinessAnalysis,
    title: "年度经营分析报告",
    caption: "深色科技风 / 数据经营分析"
  },
  {
    image: strategyPlanningReport,
    title: "战略规划汇报",
    caption: "浅色商务风 / 路径与指标"
  },
  {
    image: artThemePpt,
    title: "艺术主题 PPT",
    caption: "艺术美学风 / 创意视觉表达"
  },
  {
    image: quarterlyPerformanceReport,
    title: "季度业绩报告",
    caption: "极简汇报风 / 重点与图表"
  }
];

export function PptShowcaseCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseItems.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + showcaseItems.length) % showcaseItems.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % showcaseItems.length);
  };

  return (
    <section className="showcase-panel" aria-label="优秀 PPT 示例">
      <div className="showcase-viewport">
        <div className="showcase-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {showcaseItems.map((item) => (
            <article className="showcase-slide" key={item.title}>
              <img src={item.image} alt={item.title} />
              <div className="showcase-caption">
                <span>{item.caption}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="showcase-controls">
        <button type="button" className="icon-button" onClick={goToPrevious} aria-label="上一张">
          <ChevronLeft aria-hidden="true" />
        </button>
        <div className="showcase-dots" aria-hidden="true">
          {showcaseItems.map((item, index) => (
            <span className={index === activeIndex ? "active" : ""} key={item.title} />
          ))}
        </div>
        <button type="button" className="icon-button" onClick={goToNext} aria-label="下一张">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
