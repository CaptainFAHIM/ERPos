import { Card, Badge, Button } from "flowbite-react"
import { BiSolidCheckShield } from "react-icons/bi"
import { FaShieldHalved } from "react-icons/fa6";
import {
  FaCode,
  FaRocket,
  FaStar,
  FaCheckCircle,
  FaShieldAlt,
  FaSync,
  FaBuilding,
  FaDiscord,
  FaGlobe,
  FaEnvelope,
  FaBoxOpen,
  FaChartBar,
  FaUserFriends,
  FaCreditCard,
  FaCog,
  FaLock,
  FaCloudDownloadAlt,
  FaHeadset,
  FaFingerprint,
  FaUserShield,
  FaServer,
} from "react-icons/fa"

export default function SoftwareVersion() {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">POS Software</h1>
            <p className="text-xl text-gray-600">Powered by Captains IT</p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: FaCode, title: "Version", value: "1.0.0.0", subtext: "Released: february 30, 2025", color: "blue" },
              {
                icon: FaRocket,
                title: "Active Users",
                value: "1+",
                subtext: "Growing user base",
                color: "green",
              },
              {
                icon: FaStar,
                title: "Customer Satisfaction",
                value: "98%",
                subtext: "Based on initial feedback",
                color: "yellow",
              },
            ].map((card, index) => (
              <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <div
                  className={`flex flex-col items-center p-6 bg-gradient-to-br from-${card.color}-50 to-${card.color}-100`}
                >
                  <div className={`rounded-full p-3 mb-4 bg-${card.color}-200`}>
                    <card.icon className={`text-2xl text-${card.color}-600`} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h2>
                  <p className={`text-3xl font-bold text-${card.color}-600 mb-1`}>{card.value}</p>
                  <p className="text-sm text-gray-600 text-center">{card.subtext}</p>
                </div>
              </Card>
            ))}
          </div>
  
          <Card className="mb-12 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaCheckCircle className="inline-block mr-3 text-purple-600" />
                Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: FaBoxOpen,
                    title: "Real-time Inventory",
                    description: "Track stock levels instantly across all locations",
                  },
                  {
                    icon: FaChartBar,
                    title: "Advanced Analytics",
                    description: "Gain insights with powerful reporting tools",
                  },
                  {
                    icon: FaUserFriends,
                    title: "Multi-store Support",
                    description: "Manage multiple locations from a single dashboard",
                  },
                  { icon: FaStar, title: "Loyalty Program", description: "Reward customers and boost retention" },
                  {
                    icon: FaCreditCard,
                    title: "Integrated Payments",
                    description: "Seamless and secure transaction processing",
                  },
                  {
                    icon: FaCog,
                    title: "Customizable",
                    description: "Tailor the system to your specific business needs",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex-shrink-0">
                      <feature.icon className="text-xl text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaShieldAlt className="mr-2 text-purple-600" /> Security Measures
                </h2>
                <ul className="space-y-3">
                  {[
                    { icon: FaFingerprint, text: "End-to-end encryption" },
                    { icon: FaUserShield, text: "Two-factor authentication" },
                    { icon: BiSolidCheckShield, text: "Regular security audits" },
                    { icon: FaShieldHalved, text: "PCI DSS compliant" },
                    { icon: FaServer, text: "Data backup and recovery" },
                  ].map((measure, index) => (
                    <li key={index} className="flex items-center bg-white p-3 rounded-md shadow-sm">
                      <measure.icon className="mr-2 text-purple-600" />
                      <span className="text-sm text-gray-700">{measure.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
  
            <Card className="overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FaSync className="mr-2 text-green-600" /> Updates and Support
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FaCloudDownloadAlt className="mr-2 text-green-600" /> Update Policy
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-white p-3 rounded-md shadow-sm">
                      <li>Automatic updates</li>
                      <li>Regular feature enhancements</li>
                      <li>Security patches within 24 hours</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <FaHeadset className="mr-2 text-green-600" /> Customer Support
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-white p-3 rounded-md shadow-sm">
                      <li>24/7 live chat and email support</li>
                      <li>Dedicated account managers</li>
                      <li>Comprehensive knowledge base</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
  
          <Card className="mb-12 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <FaBuilding className="mr-2 text-indigo-600" /> About Captains IT
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 max-w-2xl">
                    At Captains IT, we have extensive experience in developing innovative IT solutions. Our expertise
                    includes building robust POS systems, inventory management solutions, SaaS platforms, and more. We are
                    committed to delivering high-quality, scalable, and efficient software tailored to meet the unique
                    needs of businesses. With a focus on innovation and reliability, we strive to empower businesses with
                    the right technology solutions.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge color="indigo" size="sm">
                      Innovative Solutions
                    </Badge>
                    <Badge color="success" size="sm">
                      Scalable Software
                    </Badge>
                    <Badge color="warning" size="sm">
                      Tailored Approach
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Button size="sm" gradientDuoTone="purpleToBlue" href="https://discord.gg/bFKWFbXgPZ" target="_blank">
                    <FaDiscord className="mr-2" /> Join our Discord
                  </Button>
                  <Button size="sm" color="light" href="https://captains-it.vercel.app/" target="_blank">
                    <FaGlobe className="mr-2" /> Visit Website
                  </Button>
                </div>
              </div>
            </div>
          </Card>
  
          <div className="text-center">
            <p className="text-gray-600 mb-2">Need assistance? Contact our support team</p>
            <a
              href="mailto:support@captainsit.com"
              className="text-lg text-blue-600 hover:underline flex items-center justify-center"
            >
              <FaEnvelope className="mr-2" /> support@captainsit.com
            </a>
          </div>
        </div>
      </div>
    )
  }

