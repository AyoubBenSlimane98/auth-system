import ResetPasswordClient from "./ResetPasswordClient";

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return <ResetPasswordClient token={token || ""} />;
}
