import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/characters" element={<Index />} />
          <Route path="/chats" element={<Index />} />
          <Route path="/chat/:id" element={<Index />} />
          <Route path="/duo" element={<Index />} />
          <Route path="/groups" element={<Index />} />
          <Route path="/memory" element={<Index />} />
          <Route path="/adventure" element={<Index />} />
          <Route path="/adventure/:id" element={<Index />} />
          <Route path="/news" element={<Index />} />
          <Route path="/coins" element={<Index />} />
          <Route path="/settings" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
