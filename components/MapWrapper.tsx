"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full rounded-2xl bg-gray-100 animate-pulse border border-nordic-dark/5"></div>
});

export default function MapWrapper({ lat, lng, title }: { lat: number, lng: number, title: string }) {
  return <PropertyMap lat={lat} lng={lng} title={title} />;
}
