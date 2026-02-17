import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GoldDivider } from "@/components/GoldDivider";
import { Calculator, Users, Calendar, DollarSign } from "lucide-react";

export function TripCostEstimator() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(3);
  const [includeHotel, setIncludeHotel] = useState(false);
  const [includeKosherMeals, setIncludeKosherMeals] = useState(false);
  const [includeGuide, setIncludeGuide] = useState(true);
  const [includeSelfDrive, setIncludeSelfDrive] = useState(false);

  // Pricing constants (USD)
  const BASE_TOUR_PER_DAY = 150; // Base tour cost per adult per day
  const CHILD_DISCOUNT = 0.5; // Children pay 50%
  const HOTEL_PER_NIGHT = 80; // Average hotel per person per night
  const KOSHER_MEAL_PER_DAY = 40; // Kosher meals per person per day
  const GUIDE_PER_DAY = 100; // Hebrew-speaking guide per day
  const SELF_DRIVE_PER_DAY = 125; // Self-driving 4x4 rental per day

  const calculateTotal = () => {
    let total = 0;

    // Base tour cost
    const totalPeople = adults + children * CHILD_DISCOUNT;
    total += BASE_TOUR_PER_DAY * totalPeople * days;

    // Hotel cost
    if (includeHotel) {
      total += HOTEL_PER_NIGHT * (adults + children) * (days - 1); // nights = days - 1
    }

    // Kosher meals
    if (includeKosherMeals) {
      total += KOSHER_MEAL_PER_DAY * (adults + children) * days;
    }

    // Guide
    if (includeGuide) {
      total += GUIDE_PER_DAY * days;
    }

    // Self-driving option (replaces guided tour)
    if (includeSelfDrive) {
      total -= BASE_TOUR_PER_DAY * totalPeople * days; // Remove base tour
      total += SELF_DRIVE_PER_DAY * days; // Add self-drive cost
    }

    return Math.round(total);
  };

  const estimatedCost = calculateTotal();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">
              Trip Cost Estimator
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get an instant estimate for your kosher adventure in Chiang Mai
          </p>
          <GoldDivider />
        </div>

        <Card className="max-w-4xl mx-auto p-8 bg-card/50 backdrop-blur border-primary/20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  Number of Adults
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={adults}
                  onChange={e =>
                    setAdults(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="text-lg"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-primary" />
                  Number of Children (0-12 years)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={e =>
                    setChildren(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="text-lg"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Trip Duration (Days)
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={e =>
                    setDays(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="text-lg"
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-semibold">
                  Optional Services
                </Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hotel"
                    checked={includeHotel}
                    onCheckedChange={checked =>
                      setIncludeHotel(checked as boolean)
                    }
                  />
                  <label htmlFor="hotel" className="text-sm cursor-pointer">
                    Hotel Accommodation (~$80/person/night)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kosher"
                    checked={includeKosherMeals}
                    onCheckedChange={checked =>
                      setIncludeKosherMeals(checked as boolean)
                    }
                  />
                  <label htmlFor="kosher" className="text-sm cursor-pointer">
                    Kosher Meals (~$40/person/day)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="guide"
                    checked={includeGuide}
                    onCheckedChange={checked =>
                      setIncludeGuide(checked as boolean)
                    }
                  />
                  <label htmlFor="guide" className="text-sm cursor-pointer">
                    Hebrew-Speaking Guide ($100/day)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selfdrive"
                    checked={includeSelfDrive}
                    onCheckedChange={checked =>
                      setIncludeSelfDrive(checked as boolean)
                    }
                  />
                  <label htmlFor="selfdrive" className="text-sm cursor-pointer">
                    Self-Driving 4x4 Rental ($125/day)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="flex flex-col justify-between">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 border-2 border-primary/30">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Estimated Total Cost
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <p className="text-5xl font-bold text-primary">
                      {estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">USD</p>
                </div>

                <div className="space-y-2 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Size:</span>
                    <span className="font-semibold">
                      {adults} adults, {children} children
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{days} days</span>
                  </div>
                  {includeHotel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nights:</span>
                      <span className="font-semibold">{days - 1} nights</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  * This is an estimate. Final price may vary based on specific
                  tour selection, season, and custom requirements.
                </p>
                <Button
                  size="lg"
                  className="w-full text-lg"
                  onClick={() => (window.location.href = "/book")}
                >
                  Get Accurate Quote
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
