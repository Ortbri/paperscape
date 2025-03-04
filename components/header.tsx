import { Asterisk } from 'lucide-react';
import Link from 'next/link';

const MarketingHeader = () => {
  // const supabase = await createClient();
  // // TODO: cached user needed + user preference via cookies
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // console.log(user);
  // TODO:if you have a subscription, no pricing item shows there!

  return (
    <>
      <header
        className={
          'bg-border/50 fixed top-0 right-0 left-0 z-50 mx-auto w-full max-w-lg backdrop-blur-3xl sm:mt-4 sm:rounded-3xl'
        }
      >
        <div className="mx-auto flex items-center gap-12 py-2 pr-2 pl-4">
          {/* Logo placeholder */}
          <Link href={'/'}>
            <div className="flex flex-1 items-center">
              <Asterisk className="h-5 w-5" strokeWidth={3} />
            </div>
          </Link>
          {/* Links */}
          <div className="flex flex-1 flex-row items-center justify-end gap-4">
            {/* if subscribed show pricing */}
            <Link href={'/pricing'} className="text-xs">
              Pricing
            </Link>
            {/* {user ? (
              <Link href={'/user'}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-foreground text-card text-sm">
                    {user.user_metadata.first_name.charAt(0) +
                      user.user_metadata.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <>
                <Link href={'/login'} className="text-xs">
                  Log in
                </Link>
                <Link href={'/signup'}>
                  <Button className="gap-1 rounded-3xl whitespace-nowrap" size={'sm'}>
                    Join for Free
                  </Button>
                </Link>
              </>
            )} */}
          </div>
        </div>
      </header>
    </>
  );
};

export default MarketingHeader;
