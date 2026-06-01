import { ref } from 'vue'

/**
 * 相册数据 — 按主题分组
 * 每张照片属于一个相册，Featured 从各相册精选
 */
const albumsData = [
  {
    id: 'shanhai',
    title: '山川湖海',
    cover: 'https://img.jialiang.dev/mountain1.jpg',
    description: '山、海与自由',
    photos: [
      {
        id: 'mountain-snow',
        title: '小珠山',
        date: '2025-04-20',
        camera: 'Nikon D7100',
        lens: '75mm F5.0',
        image: 'https://img.jialiang.dev/mountain1.jpg',
        quote: '山不说话，但所有的答案都在那里。',
      },
      {
        id: 'mountain-ridge',
        title: '泰山日出',
        date: '2023-01-11',
        camera: 'Vivo X60',
        lens: '',
        image: 'https://img.jialiang.dev/mountain2.jpg',
        quote: '解封后的登山游玩。',
      },
      {
        id: 'mountain-dusk',
        title: '云海',
        date: '2023-01-11',
        camera: 'Vivo X60',
        lens: '',
        image: 'https://img.jialiang.dev/mountain3.jpg',
        quote: '上山容易下山难！',
      },
      {
        id: 'sea-wave',
        title: '鱼鸣嘴',
        date: '2024-12-21',
        camera: 'Vivo X60',
        lens: '',
        image: 'https://img.jialiang.dev/sea1.jpg',
        quote: '鱼鸣嘴大概是黄岛最好看的景色。',
      },
      {
        id: 'sea-shore',
        title: '海边菊花',
        date: '2024-12-21',
        camera: 'Vivo X60',
        lens: '',
        image: 'https://img.jialiang.dev/sea2.jpg',
        quote: '站在岸边，觉得自己很小，世界很大。',
      },
      {
        id: 'sea-sunset',
        title: '海边日落',
        date: '2024-10-01',
        camera: 'Vivo X60',
        lens: '',
        image: 'https://img.jialiang.dev/sea3.jpg',
        quote: '海边的日落不一样——它让你相信明天。',
      },
      {
        id: 'fish-swim',
        title: '泰狮和锦鲤',
        date: '2025-06-23',
        camera: 'Nikon D7100',
        lens: '50mm F2.8',
        image: 'https://img.jialiang.dev/fish1.jpg',
        quote: '小鱼有什么烦恼呢。',
      },
    ],
  },
  {
    id: 'hongkong',
    title: '香港',
    cover: 'https://img.jialiang.dev/hk1.jpg',
    description: '霓虹、夜景与海风',
    photos: [
      {
        id: 'hk-street',
        title: '东方之珠',
        date: '2026-01-01',
        camera: 'Nikon D7100',
        lens: '22mm F13',
        image: 'https://img.jialiang.dev/hk1.jpg',
        quote: '香港的街道永远不会让你失望。每个转角都有故事。',
      },
      {
        id: 'red-bus',
        title: '红色巴士',
        date: '2026-03-13',
        camera: 'Nikon D7100',
        lens: '62mm F9.0',
        image: 'https://img.jialiang.dev/hk2.jpg',
        quote: '香港的传统反差。',
      },
      {
        id: 'hk-alley',
        title: '天桥',
        date: '2026-01-03',
        camera: 'Nikon D7100',
        lens: '40mm F11',
        image: 'https://img.jialiang.dev/hk3.JPG',
        quote: '窄巷里藏着香港最真实的样子。',
      },
      {
        id: 'bochk',
        title: '中银大厦',
        date: '2026-03-14',
        camera: 'Nikon D7100',
        lens: '18mm F14',
        image: 'https://img.jialiang.dev/hk4.JPG',
        quote: '像竹节一样，节节上升。',
      },
      {
        id: 'myself',
        title: '自拍',
        date: '2026-01-03',
        camera: 'Nikon D7100',
        lens: '68mm F5.6',
        image: 'https://img.jialiang.dev/hk5.JPG',
        quote: '祝自己圣诞快乐，新年快乐。',
      },
      {
        id: 'taipingshan',
        title: '俯瞰',
        date: '2026-01-03',
        camera: 'Nikon D7100',
        lens: '26mm F2.8',
        image: 'https://img.jialiang.dev/hk6.JPG',
        quote: '看得完繁华，却看不尽故事。',
      },
    ],
  },
  {
    id: 'renjian',
    title: '人物',
    cover: 'https://img.jialiang.dev/girl1.jpg',
    description: '孩子、女孩与运动员',
    photos: [
      {
        id: 'girl-portrait',
        title: '😍',
        date: '2025-04-12',
        camera: 'Nikon D7100',
        lens: '50mm F7.1',
        image: 'https://img.jialiang.dev/girl1.jpg',
        quote: '其实我心里只想拍樱花的。',
      },
      {
        id: 'girl-smile',
        title: '笑容',
        date: '2025-04-12',
        camera: 'Nikon D7100',
        lens: '50mm F7.1',
        image: 'https://img.jialiang.dev/girl2.jpg',
        quote: '最好的照片，往往在被拍的人忘了镜头存在的时候。',
      },
      {
        id: 'zhanqiao',
        title: '栈桥边',
        date: '2026-03-28',
        camera: 'Nikon D7100',
        lens: '50mm F13',
        image: 'https://img.jialiang.dev/girl3.JPG',
        quote: '要风度不要温度，三月底的海风可不温柔。',
      },
      {
        id: 'girl-quiet',
        title: '背影',
        date: '2025-05-25',
        camera: 'Nikon D7100',
        lens: '300mm F9',
        image: 'https://img.jialiang.dev/girl4.jpg',
        quote: '不说话的时候，反而说了最多。',
      },
      {
        id: 'kid-play',
        title: '童年',
        date: '2026-05-25',
        camera: 'Nikon D7100',
        lens: '300mm F11',
        image: 'https://img.jialiang.dev/kids1.jpg',
        quote: '孩子眼里，世界永远是新奇的。',
      },
      {
        id: 'girl',
        title: '小女孩',
        date: '2025-05-01',
        camera: 'Nikon D7100',
        lens: '200mm F7',
        image: 'https://img.jialiang.dev/kids2.jpg',
        quote: '孩子眼里，世界永远是新奇的。',
      },
      {
        id: 'volleyball1',
        title: '女排',
        date: '2025-06-15',
        camera: 'Nikon D7100',
        lens: '150mm F6.3',
        image: 'https://img.jialiang.dev/sport1.jpg',
        quote: '崂山沙排。',
      },
      {
        id: 'volleyball2',
        title: '男排',
        date: '2025-06-15',
        camera: 'Nikon D7100',
        lens: '110mm F6.3',
        image: 'https://img.jialiang.dev/sport2.jpg',
        quote: '崂山沙排。',
      },
      {
        id: 'volleyball3',
        title: '男排',
        date: '2025-06-15',
        camera: 'Nikon D7100',
        lens: '110mm F5.6',
        image: 'https://img.jialiang.dev/sport3.jpg',
        quote: '男排和女排简直是两个运动。',
      },
    ],
  },
]

const albums = ref(albumsData)

export function usePhotos() {
  function getFeatured() {
    return albums.value.map(a => ({ albumId: a.id, ...a.photos[0] }))
  }

  function getAlbums() {
    return albums.value
  }

  function getById(photoId) {
    for (const album of albums.value) {
      const found = album.photos.find(p => p.id === photoId)
      if (found) return { albumId: album.id, ...found }
    }
    return null
  }

  function getAlbumOfPhoto(photoId) {
    for (const album of albums.value) {
      if (album.photos.some(p => p.id === photoId)) return album
    }
    return null
  }

  return { albums, getFeatured, getAlbums, getById, getAlbumOfPhoto }
}
