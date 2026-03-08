import { ReactNode } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { formatMultiCurrency } from "@shared/currencyConversion";

interface CurrencyTooltipProps {
  thb: number;
  children: ReactNode;
}

export function CurrencyTooltip({ thb, children }: CurrencyTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{children}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{formatMultiCurrency(thb)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Approximate rates, updated monthly
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
