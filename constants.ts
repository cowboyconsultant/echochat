import { Contact, Sender } from './types';

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah (Bestie)',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    messages: [
      { id: '1', sender: Sender.THEM, text: 'Omg did you see that?', timestamp: '2023-10-26T10:00:00' },
      { id: '2', sender: Sender.ME, text: 'NO WHAT HAPPENED!!! 😱', timestamp: '2023-10-26T10:01:00' },
      { id: '3', sender: Sender.THEM, text: 'He literally just walked in wearing the same shirt.', timestamp: '2023-10-26T10:02:00' },
      { id: '4', sender: Sender.ME, text: 'LMAO stop rn 💀💀💀', timestamp: '2023-10-26T10:03:00' },
      { id: '5', sender: Sender.THEM, text: 'Im dying inside help', timestamp: '2023-10-26T10:04:00' },
      { id: '6', sender: Sender.ME, text: 'Coming to rescue u, be there in 5 w coffee ☕️', timestamp: '2023-10-26T10:05:00' },
    ],
  },
  {
    id: '2',
    name: 'Mr. Johnson (Boss)',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    messages: [
      { id: '1', sender: Sender.THEM, text: 'Can you send me the Q3 report?', timestamp: '2023-10-25T09:00:00' },
      { id: '2', sender: Sender.ME, text: 'Good morning, certainly. I will email that to you shortly.', timestamp: '2023-10-25T09:05:00' },
      { id: '3', sender: Sender.THEM, text: 'Thanks. Also, are we still on for the 2pm meeting?', timestamp: '2023-10-25T09:10:00' },
      { id: '4', sender: Sender.ME, text: 'Yes, I have the conference room booked. See you then.', timestamp: '2023-10-25T09:12:00' },
    ],
  },
  {
    id: '3',
    name: 'Mom',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    messages: [
      { id: '1', sender: Sender.THEM, text: 'Call me when you can.', timestamp: '2023-10-24T18:00:00' },
      { id: '2', sender: Sender.ME, text: 'Hey Mom! Just finishing up work. Is everything okay?', timestamp: '2023-10-24T18:15:00' },
      { id: '3', sender: Sender.THEM, text: 'Yes just wanted to hear your voice love you', timestamp: '2023-10-24T18:30:00' },
      { id: '4', sender: Sender.ME, text: 'Love you too! Calling in 10 mins ❤️', timestamp: '2023-10-24T18:31:00' },
    ],
  },
];
