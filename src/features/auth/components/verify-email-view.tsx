import { Image } from "expo-image";
import { Link } from "expo-router";
import { CircleAlert, CircleCheck, MailCheck } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { ResendVerificationForm } from "./resend-verification-form";

type VerifyEmailViewProps = {
  verified: boolean;
  hasError: boolean;
};

export function VerifyEmailView({ verified, hasError }: VerifyEmailViewProps) {
  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="mx-auto w-full max-w-md flex-1 px-6">
          <View className="items-center pt-12">
            <Link href="/" accessibilityLabel="Go to MatchUp home">
              <Image
                source={require("@/assets/images/matchup-logo.png")}
                style={{ width: 150, height: 82 }}
                contentFit="contain"
                accessibilityLabel="MatchUp"
              />
            </Link>
          </View>

          <ScrollView
            contentContainerClassName="flex-grow justify-center pb-24"
            showsVerticalScrollIndicator={false}
          >
            {verified ? (
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <CircleCheck size={32} color="#00B83F" strokeWidth={2} />
                </View>

                <Text className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                  Email verified
                </Text>

                <Text className="mt-3 max-w-[300px] text-center text-sm leading-6 text-slate-500">
                  Your email has been verified. Continue to set up your MatchUp
                  account.
                </Text>

                <Link href="/onboarding" asChild>
                  <Button className="mt-8">Continue</Button>
                </Link>
              </View>
            ) : hasError ? (
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <CircleAlert size={32} color="#EF4444" strokeWidth={2} />
                </View>

                <Text className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                  Link expired
                </Text>

                <Text className="mt-3 max-w-[310px] text-center text-sm leading-6 text-slate-500">
                  This verification link is no longer valid. Enter your email
                  and we&apos;ll send you a new one.
                </Text>

                <ResendVerificationForm />

                <Link href="/login" className="mt-6">
                  <Text className="text-sm font-semibold text-slate-900 underline underline-offset-2">
                    Back to log in
                  </Text>
                </Link>
              </View>
            ) : (
              <View className="items-center">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50">
                  <MailCheck size={32} color="#00B83F" strokeWidth={2} />
                </View>

                <Text className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
                  Check your email
                </Text>

                <Text className="mt-3 max-w-[310px] text-center text-sm leading-6 text-slate-500">
                  We&apos;ve sent a verification link to your email. Open it to
                  confirm your address and finish creating your account.
                </Text>

                <Text className="mt-8 text-sm text-slate-500">
                  Already verified?{" "}
                  <Link href="/login">
                    <Text className="font-semibold text-slate-900 underline underline-offset-2">
                      Log in
                    </Text>
                  </Link>
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
