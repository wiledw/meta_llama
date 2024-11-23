import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import SignInWithGoogleButton from "./SignInWithGoogleButton"

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Login with your Google account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action="">
             <SignInWithGoogleButton/> 
        </form>
      </CardContent>
    </Card>
  )
}
