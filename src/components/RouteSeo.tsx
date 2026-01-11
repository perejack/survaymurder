import { useLocation } from "react-router-dom";
import Seo from "@/components/Seo";

const RouteSeo = () => {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return (
      <Seo
        title="EarnSpark Kenya | Task Completion Platform"
        description="EarnSpark Kenya is a task-based platform where eligible users can complete available tasks and earn rewards. Earnings and task availability vary. Terms apply."
      />
    );
  }

  if (pathname === "/about") {
    return (
      <Seo
        title="About EarnSpark | Company Info"
        description="Learn about EarnSpark, operated by BLUEROCK PARTNERS (BN-P7SAD8YK). Task availability varies and no income is guaranteed."
      />
    );
  }

  if (pathname === "/contact") {
    return (
      <Seo
        title="Contact EarnSpark | Support & Business Info"
        description="Contact EarnSpark support. Get business details, support hours, and how to reach us."
      />
    );
  }

  if (pathname === "/terms") {
    return (
      <Seo
        title="Terms of Service | EarnSpark"
        description="Read EarnSpark Terms of Service including eligibility, task availability, and withdrawal conditions."
      />
    );
  }

  if (pathname === "/privacy") {
    return (
      <Seo
        title="Privacy Policy | EarnSpark"
        description="EarnSpark Privacy Policy explaining what data we collect and how it is used."
      />
    );
  }

  if (pathname === "/cookies") {
    return (
      <Seo
        title="Cookie Policy | EarnSpark"
        description="EarnSpark Cookie Policy: how cookies are used for essential functionality and improving user experience."
      />
    );
  }

  if (pathname === "/survey") {
    return <Seo title="Tasks & Surveys | EarnSpark" description="Task participation area." noindex />;
  }

  if (pathname === "/profile") {
    return <Seo title="My Profile | EarnSpark" description="User account profile." noindex />;
  }

  return <Seo title="Page Not Found | EarnSpark" description="The requested page was not found." noindex />;
};

export default RouteSeo;
