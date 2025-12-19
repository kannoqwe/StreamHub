import { Stream, Category, User, ChatMessage } from './types';

export const CURRENT_USER: User = {
    id: 123,
    username: 'kannoqwe',
    displayName: 'kannoqwe',
    avatar: 'https://picsum.photos/seed/user1/200/200',
    bio: 'Just a gamer trying to make it in the digital world. 🎮 ✨',
    followers: 1240,
    isOnline: true,
};

export const MOCK_CATEGORIES: Category[] = [
    {
        id: 0,
        name: 'Just Chatting',
        image: 'https://picsum.photos/seed/cat1/300/400',
    },
    {
        id: 1,
        name: 'Minecraft',
        image: 'https://picsum.photos/seed/cat2/300/400',
    },
    {
        id: 2,
        name: 'Valorant',
        image: 'https://picsum.photos/seed/cat3/300/400',
    },
    {
        id: 4,
        name: 'GTA V',
        image: 'https://picsum.photos/seed/cat4/300/400',
    },
    {
        id: 5,
        name: 'Counter Strike',
        image: 'https://picsum.photos/seed/cat5/300/400',
    },
];

export const MOCK_STREAMS: Stream[] = [
    {
        id: 1,
        title: '🔴 LATE NIGHT VIBES | RANKED CLIMB | !commands',
        thumbnail: 'https://picsum.photos/seed/stream1/800/450',
        viewerCount: 14203,
        category: 'Valorant',
        tags: ['English', 'FPS', 'Competitive'],
        startedAt: '2 hours ago',
        streamer: {
            id: 1,
            username: 'pro_gamer',
            displayName: 'pro_gamer',
            avatar: 'https://picsum.photos/seed/u2/100/100',
            followers: 500000,
            isOnline: true,
            bio: 'Professional FPS player.',
        },
    },
    {
        id: 2,
        title: 'Building a React App from Scratch! 💻',
        thumbnail: 'https://picsum.photos/seed/stream2/800/450',
        viewerCount: 890,
        category: 'Software Development',
        tags: ['Programming', 'Web Dev', 'Education'],
        startedAt: '45 mins ago',
        streamer: {
            id: 2,
            username: 'code_wizard',
            displayName: 'code_wizard',
            avatar: 'https://picsum.photos/seed/u3/100/100',
            followers: 12000,
            isOnline: true,
            bio: 'I turn coffee into code.',
        },
    },
    {
        id: 3,
        title: 'Speedrunning Minecraft Any%',
        thumbnail: 'https://picsum.photos/seed/stream3/800/450',
        viewerCount: 3500,
        category: 'Minecraft',
        tags: ['Speedrun', 'Gaming'],
        startedAt: '1 hour ago',
        streamer: {
            id: 3,
            username: 'block_master',
            displayName: 'block_master',
            avatar: 'https://picsum.photos/seed/u4/100/100',
            followers: 25000,
            isOnline: true,
            bio: 'Blocks and rocks.',
        },
    },
    {
        id: 4,
        title: 'Cozy Rain Sounds & Reading 📖',
        thumbnail: 'https://picsum.photos/seed/stream4/800/450',
        viewerCount: 450,
        category: 'ASMR',
        tags: ['Relax', 'Reading'],
        startedAt: '3 hours ago',
        streamer: {
            id: 4,
            username: 'sleepy_time',
            displayName: 'sleepy_time',
            avatar: 'https://picsum.photos/seed/u5/100/100',
            followers: 8000,
            isOnline: true,
            bio: 'Relax with me.',
        },
    },
];

export const MOCK_CHAT: ChatMessage[] = [
    {
        id: 1,
        user: 'CoolUser123',
        color: '#ff0000',
        text: 'PogChamp!',
        timestamp: Date.now(),
    },
    {
        id: 2,
        user: 'Mod_Steve',
        color: '#00ff00',
        text: 'Please follow the rules.',
        timestamp: Date.now(),
    },
    {
        id: 3,
        user: 'Newbie',
        color: '#d946ef',
        text: 'What game is this?',
        timestamp: Date.now(),
    },
];
