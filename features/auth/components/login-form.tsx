"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export function LoginForm() {
  return (
    <div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            MatchUp
          </CardTitle>

          <p className="text-center text-muted-foreground">Welcome back</p>
        </CardHeader>

        <CardContent></CardContent>
      </Card>
    </div>
  );
}
