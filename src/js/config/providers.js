export const PROVIDERS = [
  { q:'4K',    movie:id=>`https://vidlink.pro/movie/${id}?autoplay=true&primaryColor=e50914`,          tv:(id,s,e)=>`https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true&primaryColor=e50914` },
  { q:'1080p', movie:id=>`https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=true`,                      tv:(id,s,e)=>`https://vidsrc.cc/v3/embed/tv/${id}/${s}/${e}?autoPlay=true` },
  { q:'1080p', movie:id=>`https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=true`,                      tv:(id,s,e)=>`https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}?autoPlay=true` },
  { q:'4K',    movie:id=>`https://vidfast.pro/movie/${id}?autoPlay=true`,                             tv:(id,s,e)=>`https://vidfast.pro/tv/${id}/${s}/${e}?autoPlay=true` },
  { q:'4K',    movie:id=>`https://player.videasy.net/movie/${id}?colour=e50914`,                      tv:(id,s,e)=>`https://player.videasy.net/tv/${id}/${s}/${e}?colour=e50914` },
  { q:'1080p', movie:id=>`https://www.2embed.stream/embed/movie/${id}`,                               tv:(id,s,e)=>`https://www.2embed.stream/embed/tv/${id}/${s}/${e}` },
  { q:'1080p', movie:id=>`https://vidsrcme.ru/embed/movie?tmdb=${id}&autoplay=1`,                     tv:(id,s,e)=>`https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}&autoplay=1` },
  { q:'1080p', movie:id=>`https://vidsrc.su/embed/movie/${id}`,                                       tv:(id,s,e)=>`https://vidsrc.su/embed/tv/${id}/${s}/${e}` },
  { q:'1080p', movie:id=>`https://rivestream.org/embed?type=movie&id=${id}`,                          tv:(id,s,e)=>`https://rivestream.org/embed?type=tv&id=${id}&season=${s}&episode=${e}` },
  { q:'1080p', movie:id=>`https://player.smashy.stream/movie/${id}`,                                  tv:(id,s,e)=>`https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },
  { q:'1080p', movie:id=>`https://player.vidplus.to/embed/movie/${id}?autoplay=true`,                 tv:(id,s,e)=>`https://player.vidplus.to/embed/tv/${id}/${s}/${e}?autoplay=true` },
  { q:'1080p', movie:id=>`https://multiembed.mov/?video_id=${id}&tmdb=1`,                             tv:(id,s,e)=>`https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
  { q:'1080p', movie:id=>`https://embed.su/embed/movie/${id}`,                                        tv:(id,s,e)=>`https://embed.su/embed/tv/${id}/${s}/${e}` },
  { q:'1080p', movie:id=>`https://player.autoembed.cc/embed/movie/${id}`,                             tv:(id,s,e)=>`https://player.autoembed.cc/embed/tv/${id}/${s}/${e}` },
  { q:'4K',    movie:id=>`https://player.vidzee.wtf/embed/movie/${id}`,                               tv:(id,s,e)=>`https://player.vidzee.wtf/embed/tv/${id}/${s}/${e}` },
  { q:'4K',    movie:id=>`https://mappletv.uk/watch/movie/${id}`,                                     tv:(id,s,e)=>`https://mappletv.uk/watch/tv/${id}/${s}/${e}` },
  { q:'1080p', movie:id=>`https://www.vidsrc.wtf/api/2/movie/${id}`,                                  tv:(id,s,e)=>`https://www.vidsrc.wtf/api/2/tv/${id}/${s}/${e}` },
  { q:'1080p', movie:id=>`https://vidlink.pro/movie/${id}?icons=vid`,                                 tv:(id,s,e)=>`https://vidlink.pro/tv/${id}/${s}/${e}?icons=vid` },
  { q:'1080p', movie:id=>`https://vidfast.pro/movie/${id}`,                                           tv:(id,s,e)=>`https://vidfast.pro/tv/${id}/${s}/${e}` },
];

export const QC = { '4K':'#ffd700', '1080p':'#6ca4e8' };

export const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://thingproxy.freeboard.io/fetch/${u}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${u}`,
];