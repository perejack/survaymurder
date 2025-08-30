import { 
  MessageSquare, 
  Car, 
  Camera, 
  FileText, 
  Share2, 
  ShoppingCart,
  PhoneCall,
  MapPin 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const tasks = [
  {
    id: 1,
    title: "Complete Surveys",
    description: "Share your opinions and get paid for market research surveys",
    icon: MessageSquare,
    earning: "KSh 50-200",
    time: "5-15 mins",
    difficulty: "Easy",
    available: 47
  },
  {
    id: 2,
    title: "Delivery Tasks",
    description: "Deliver packages and documents around your neighborhood",
    icon: Car,
    earning: "KSh 200-800",
    time: "30-60 mins",
    difficulty: "Medium",
    available: 23
  },
  {
    id: 3,
    title: "Photo Tasks",
    description: "Take photos of locations, products, or events for businesses",
    icon: Camera,
    earning: "KSh 100-500",
    time: "10-30 mins",
    difficulty: "Easy",
    available: 31
  },
  {
    id: 4,
    title: "Data Entry",
    description: "Input data, transcribe audio, or manage spreadsheets",
    icon: FileText,
    earning: "KSh 300-600",
    time: "20-45 mins",
    difficulty: "Easy",
    available: 19
  },
  {
    id: 5,
    title: "Social Media",
    description: "Manage social accounts, create content, or engage with followers",
    icon: Share2,
    earning: "KSh 150-400",
    time: "15-30 mins",
    difficulty: "Easy",
    available: 38
  },
  {
    id: 6,
    title: "Shopping Tasks",
    description: "Mystery shopping, price checks, or product reviews",
    icon: ShoppingCart,
    earning: "KSh 250-700",
    time: "30-90 mins",
    difficulty: "Medium",
    available: 15
  },
  {
    id: 7,
    title: "Phone Surveys",
    description: "Conduct phone interviews or customer service calls",
    icon: PhoneCall,
    earning: "KSh 400-900",
    time: "20-40 mins",
    difficulty: "Medium",
    available: 12
  },
  {
    id: 8,
    title: "Local Research",
    description: "Visit locations, check business hours, or verify information",
    icon: MapPin,
    earning: "KSh 200-600",
    time: "15-45 mins",
    difficulty: "Easy",
    available: 26
  }
];

const TaskCategories = () => {
  const navigate = useNavigate();

  const handleStartTask = () => {
    navigate('/survey');
  };

  return (
    <section id="tasks" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Choose Your
            <span className="block gradient-earning bg-clip-text text-transparent">
              Earning Method
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pick from hundreds of verified tasks that fit your schedule and skills. 
            All payments are guaranteed and processed instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tasks.map((task, index) => (
            <Card 
              key={task.id} 
              className="task-card p-6 hover-lift bg-card border-border shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                {/* Icon and availability */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 gradient-hero rounded-xl flex items-center justify-center">
                    <task.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-medium">
                    {task.available} available
                  </div>
                </div>

                {/* Title and description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Earning:</span>
                    <span className="text-sm font-semibold text-accent">{task.earning}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Time:</span>
                    <span className="text-sm">{task.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Level:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.difficulty === 'Easy' ? 'bg-success/10 text-success' :
                      task.difficulty === 'Medium' ? 'bg-accent/10 text-accent' :
                      'bg-secondary/10 text-secondary'
                    }`}>
                      {task.difficulty}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <Button 
                  onClick={handleStartTask}
                  className="w-full gradient-hero text-white hover:opacity-90 hover:scale-105 transition-all duration-300"
                >
                  Start Earning
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={handleStartTask}
            className="gradient-earning text-white px-8 py-6 text-lg hover-bounce hover:scale-105 transition-all duration-300"
          >
            Start Earning Now - {tasks.reduce((sum, task) => sum + task.available, 0)} Tasks Available!
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TaskCategories;