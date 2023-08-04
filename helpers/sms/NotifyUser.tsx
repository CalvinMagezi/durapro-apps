import { toast } from "react-hot-toast";

const NotifyUser = async (phone_number: string) => {
  console.log(phone_number);
  try {
    const response = await fetch("/api/sms/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phone_number,
      }),
    });

    const res = await response.json();
    // console.log(res);

    if (res.success) {
      toast.success("SMS sent to user", {
        duration: 3000,
      });
      return { success: true };
    } else {
      toast.error("SMS not sent to user", {
        duration: 3000,
      });
      return { success: false };
    }
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};

export default NotifyUser;
