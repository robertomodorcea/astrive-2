import { TooltipProvider } from '@/components/ui/tooltip';
import { BuilderProvider } from '@/components/builder/BuilderContext';
import { BuilderLayout } from '@/components/builder/BuilderLayout';

function App() {
  return (
    <TooltipProvider>
      <BuilderProvider>
        <BuilderLayout />
      </BuilderProvider>
    </TooltipProvider>
  );
}

export default App;
