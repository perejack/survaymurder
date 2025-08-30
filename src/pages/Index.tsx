import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TaskCategories from "@/components/TaskCategories";
import EarningsDashboard from "@/components/EarningsDashboard";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="overflow-x-hidden">
        <Hero />
        <TaskCategories />
        <EarningsDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;