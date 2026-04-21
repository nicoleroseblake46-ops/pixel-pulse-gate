import { Tag, CreditCard, Zap, Network, Wrench } from "lucide-react";
import { SectionPage } from "@/components/SectionPage";

export const Sales = () => (
  <SectionPage
    title="Sales"
    tagline="Limited-time deals refreshed every hour. Lock in before they vanish."
    Icon={Tag}
    items={[
      { name: "Mega Bundle Q1", meta: "All categories · 30 day access", price: "$149", tag: "-40%" },
      { name: "Proxy + Tools Combo", meta: "Save when bought together", price: "$79", tag: "HOT" },
      { name: "Black Card Pack ×10", meta: "High balance · verified", price: "$220" },
      { name: "Socks Premium ×500", meta: "Residential · 47 countries", price: "$45", tag: "FRESH" },
      { name: "Annual Toolkit", meta: "All tools, one license", price: "$390" },
      { name: "Starter Pack", meta: "Perfect for new agents", price: "$25" },
    ]}
  />
);

export const Cards = () => (
  <SectionPage
    title="Cards"
    tagline="Verified cards with instant balance check & refund guarantee."
    Icon={CreditCard}
    items={[
      { name: "Visa Classic ×5", meta: "USA · $300+ balance", price: "$45" },
      { name: "Mastercard Gold ×3", meta: "EU · $800+ balance", price: "$95", tag: "PREMIUM" },
      { name: "Amex Platinum", meta: "USA · $2K+ balance", price: "$210" },
      { name: "Bulk Pack ×20", meta: "Mixed regions · auto-checked", price: "$160", tag: "BULK" },
      { name: "Debit Bundle", meta: "Low risk · stable", price: "$70" },
      { name: "BIN Lookup +", meta: "Live database access", price: "$15" },
    ]}
  />
);

export const Socks = () => (
  <SectionPage
    title="Socks"
    tagline="Fresh residential SOCKS5 from a 3.5K+ pool, refreshed daily."
    Icon={Zap}
    items={[
      { name: "USA Pool · 100", meta: "99.9% uptime", price: "$12" },
      { name: "EU Pool · 250", meta: "Multi-country", price: "$28", tag: "POPULAR" },
      { name: "Global ×500", meta: "47 countries", price: "$45", tag: "BEST VALUE" },
      { name: "Premium ×1000", meta: "Static IPs · 30 day", price: "$120" },
      { name: "Asia Pack ×150", meta: "JP · KR · SG", price: "$22" },
      { name: "Mobile 4G ×50", meta: "True mobile carrier IPs", price: "$60", tag: "NEW" },
    ]}
  />
);

export const Proxy = () => (
  <SectionPage
    title="Proxy"
    tagline="Datacenter, residential, mobile — choose your battlefield."
    Icon={Network}
    items={[
      { name: "DC Proxy ×100", meta: "Datacenter · 1Gbps", price: "$18" },
      { name: "Residential 5GB", meta: "Pay-as-you-go", price: "$40", tag: "FAST" },
      { name: "Mobile 4G Plan", meta: "Unlimited rotation", price: "$95" },
      { name: "Sneaker Pack", meta: "Optimised for drops", price: "$70", tag: "DROP" },
      { name: "Streaming Pack", meta: "Geo-unblock 30+ regions", price: "$25" },
      { name: "ISP Premium ×50", meta: "Static · ultra clean", price: "$110" },
    ]}
  />
);

export const Tools = () => (
  <SectionPage
    title="Tools"
    tagline="GPU-accelerated checkers, scrapers and automation kits."
    Icon={Wrench}
    items={[
      { name: "Checker v6", meta: "5x faster · multi-threaded", price: "$85", tag: "v6" },
      { name: "Scraper Suite", meta: "Headless · undetectable", price: "$120" },
      { name: "Account Generator", meta: "20+ services supported", price: "$55" },
      { name: "BIN Database Pro", meta: "Updated weekly", price: "$30" },
      { name: "Bot Framework", meta: "Custom flows · Python", price: "$200", tag: "PRO" },
      { name: "Captcha Solver Key", meta: "10K solves included", price: "$40" },
    ]}
  />
);
