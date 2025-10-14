import Pusher from 'pusher-js/react-native';

// export const pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_KEY!, {
//   cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER!,
// });

export const pusher = new Pusher("4bc00d653dadb943c6cb", {
  cluster: "mt1",
});
