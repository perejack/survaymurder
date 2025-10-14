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
    description: "Share your opinions and participate in market research surveys",
    icon: MessageSquare,
    earning: "Varies",
    time: "Varies",
    difficulty: "Easy",
    available: "Limited"
  },
  {
    id: 2,
    title: "Delivery Tasks",
    description: "Deliver packages and documents around your neighborhood",
    icon: Car,
    earning: "Varies",
    time: "Varies",
    difficulty: "Medium",
    available: "Limited"
  },
  {
    id: 3,
    title: "Photo Tasks",
    description: "Take photos of locations, products, or events",
    icon: Camera,
    earning: "Varies",
    time: "Varies",
    difficulty: "Easy",
    available: "Limited"
  },
  {
    id: 4,
    title: "Data Entry",
    description: "Input data, transcribe content, or manage information",
    icon: FileText,
    earning: "Varies",
    time: "Varies",
    difficulty: "Easy",
    available: "Limited"
  },
  {
    id: 5,
    title: "Social Media",
    description: "Social media related tasks and activities",
    icon: Share2,
    earning: "Varies",
    time: "Varies",
    difficulty: "Easy",
    available: "Limited"
  },
  {
    id: 6,
    title: "Shopping Tasks",
    description: "Shopping related assignments and reviews",
    icon: ShoppingCart,
    earning: "Varies",
    time: "Varies",
    difficulty: "Medium",
    available: "Limited"
  },
  {
    id: 7,
    title: "Phone Surveys",
    description: "Phone-based research and feedback tasks",
    icon: PhoneCall,
    earning: "Varies",
    time: "Varies",
    difficulty: "Medium",
    available: "Limited"
  },
  {
    id: 8,
    title: "Local Research",
    description: "Location-based research and verification tasks",
    icon: MapPin,
    earning: "Varies",
    time: "Varies",
    difficulty: "Easy",
    available: "Limited"
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
            Browse available tasks when they become available. Task availability, payments, and eligibility vary.
            No guaranteed income or specific earning amounts.
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
                    {task.available}
                  </div>
                </div>

                {/* Title and description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Stats (no fixed earning/time; avoid absolute claims) */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Details:</span>
                    <span className="text-xs text-muted-foreground">Earnings and time vary by task</span>
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
            Browse Available Tasks
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TaskCategories;