/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
  images: {
	domains: ['i.imgur.com', 'dilxwvfkfup17.cloudfront.net'], // Add other domains as needed
  },
}   

// module.exports = {
//     images: {
//       remotePatterns: [
//         {
//             protocol: 'https',
//             hostname: 'i.imgur.com',
//             port: '',
//             pathname: '',
//         },
//         {
//             protocol: 'https',
//             hostname: 'dilxwvfkfup17.cloudfront.net',
//             port: '',
//             pathname: '',
//         },
//       ],
//     },
//   }


