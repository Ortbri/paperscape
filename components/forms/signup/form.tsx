'use client';

import { signupAction } from '@/actions/auth/signup';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { SignUpSchema } from './schema';

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>();

  /* ------------------------------- hook forms ------------------------------- */
  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  /* ------------------------------- handle form ------------------------------ */
  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    try {
      const result = await signupAction(data);

      // Check for any server error first
      if (result.serverError) {
        form.setError('root', {
          message: result.serverError,
        });
        return;
      }

      // you can also handle validation errors

      // Handle the error case if there's an error inside result.data
      if (result.data?.error) {
        form.setError('root', {
          message: result.data.error,
        });
        return;
      }

      // If a redirect URL is provided, perform the redirect
      if (result.data?.redirectTo) {
        // If everything goes fine, show the success toast
        toast.success('Success!', {
          description: 'You created your account!',
          duration: 10000,
        });
        router.push(result.data.redirectTo); // Redirect to the path
        return;
      }
    } catch (error) {
      console.error(error);
      form.setError('root', {
        message: 'An unexpected error occurred',
      });
    }
  };

  /* --------------------------------- return --------------------------------- */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Daniella" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Lim" type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="daniella@gmail.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="********"
                    type={showPassword ? 'text' : 'password'}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>

                {/* state for viewing */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing up...' : 'Sign up'}
        </Button>
      </form>
    </Form>
  );
}
