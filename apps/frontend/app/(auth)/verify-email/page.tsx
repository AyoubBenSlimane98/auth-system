import VerifyEmailClient from "./VerifyEmailClient";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return <VerifyEmailClient token={token || ""} />;
}
