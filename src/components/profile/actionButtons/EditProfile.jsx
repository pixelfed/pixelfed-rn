import { Link } from "expo-router";
import { Button } from "tamagui";

export default function EditProfile() {
    return (
        <Link href="/settings/profile" asChild>
          <Button
            theme="light"
            my="$3"
            bg="$gray7"
            size="$4"
            color="black"
            fontWeight="bold"
            fontSize="$6"
            flexGrow={1}
          >
            Edit profile
          </Button>
        </Link>
    )
}