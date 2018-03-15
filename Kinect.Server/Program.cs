using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fleck;
using Microsoft.Kinect;
using Microsoft.Kinect.Toolkit.Interaction;
using Microsoft.Kinect.Toolkit.Controls;
using Microsoft.Kinect.Toolkit;


namespace Kinect.Server
{
    public class NewInteractionClient : IInteractionClient
    {
        public InteractionInfo GetInteractionInfoAtLocation(int skeletonTrackingId, InteractionHandType handType, double x, double y)
        {
            var result = new InteractionInfo();
                  result.IsGripTarget = true;
                    result.IsPressTarget = true;
                    result.PressAttractionPointX = 0.5;
                result.PressAttractionPointY = 0.5;
                result.PressTargetControlId = 1;

         return result;
        }
    }

    class Program
    {
        static List<IWebSocketConnection> _clients = new List<IWebSocketConnection>();

        static Skeleton[] _skeletons = new Skeleton[6];

        static Mode _mode = Mode.Color;

        static CoordinateMapper _coordinateMapper;

        static UserInfo[] userInfos = new UserInfo[6];

        static InteractionStream its;
        static KinectSensor sensor;

        static void Main(string[] args)
        {
            InitializeConnection();
            InitilizeKinect();

            Console.ReadLine();
        }

        static void InitializeConnection()
        {
            var server = new WebSocketServer("ws://localhost:8181");

            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    _clients.Add(socket);
                };

                socket.OnClose = () =>
                {
                    _clients.Remove(socket);
                };
            });
        }

        static void InitilizeKinect()
        {
            sensor = KinectSensor.KinectSensors.SingleOrDefault();


            if (sensor != null)
            {
                sensor.ColorStream.Enable(ColorImageFormat.RgbResolution640x480Fps30);
                sensor.SkeletonStream.Enable();
                sensor.DepthStream.Enable(DepthImageFormat.Resolution320x240Fps30);

                sensor.AllFramesReady += Sensor_AllFramesReady;
                _coordinateMapper = sensor.CoordinateMapper;

                its = new InteractionStream(sensor, new NewInteractionClient());
                its.InteractionFrameReady += OnInteractionFrameReady;

                sensor.Start();
            }
        }

        static void Sensor_AllFramesReady(object sender, AllFramesReadyEventArgs e)
        {

            using (var frame = e.OpenSkeletonFrame())
            {
                if (frame != null)
                {

                    frame.CopySkeletonDataTo(_skeletons);
                    try
                    {
                        var accelerometerReading = sensor.AccelerometerGetCurrentReading();
                        //Console.WriteLine("processed skeleton");
                        its.ProcessSkeleton(_skeletons, accelerometerReading, frame.Timestamp);
                    }
                    catch (NullReferenceException err)
                    {
                    }
                    var users = _skeletons.Where(s => s.TrackingState == SkeletonTrackingState.Tracked).ToList();

                    if (users.Count > 0)
                    {

                        string json = users.Serialize(_coordinateMapper, _mode);

                        foreach (var socket in _clients)
                        {
                            socket.Send(json);
                        }
                    }
                }
            }
        }

        static void OnInteractionFrameReady(object sender, InteractionFrameReadyEventArgs e)
        {
            Console.WriteLine("User frame");
            using (InteractionFrame frame = e.OpenInteractionFrame())
            {
                Console.WriteLine("User frame");
                if (frame != null)
                {
                    frame.CopyInteractionDataTo(userInfos);

                    foreach (UserInfo userInfo in userInfos)
                    {
                        Console.WriteLine("User ", userInfo);
                        foreach (InteractionHandPointer handPointer in userInfo.HandPointers)
                        {

                            string action = null;

                            switch (handPointer.HandEventType)
                            {
                                case InteractionHandEventType.Grip:
                                    action = "gripped";
                                    break;

                                case InteractionHandEventType.GripRelease:
                                    action = "released";
                                    break;
                            }

                            if (action != null)
                            {
                                string handSide = "unknown";

                                switch (handPointer.HandType)
                                {
                                    case InteractionHandType.Left:
                                        handSide = "left";
                                        break;

                                    case InteractionHandType.Right:
                                        handSide = "right";
                                        break;
                                }

                                Console.WriteLine("User " + userInfo.SkeletonTrackingId + " " + action + " their " + handSide + "hand.");
                            }
                        }
                    }
                }
            }
        }
    }
}
